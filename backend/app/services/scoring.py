"""
Motor do Índice de Trafegabilidade (0-100) — o coração explicável do LinhaMap.

Implementa uma **regressão ponderada transparente** (Seção 5-IA-2 e 6.3): cada
fator é normalizado para um sub-score 0-100 e combinado por pesos fixos. NÃO é
um modelo caixa-preta — o sistema sempre explica POR QUE um trecho recebeu
determinado risco (Regra de Negócio 3).

Fatores e pesos (somam 1.0):
    - chuva acumulada 72h ....... 0.30  (Regra 6: peso importante)
    - previsão de chuva 7 dias .. 0.25  (Regra 7: alerta preventivo)
    - declividade ............... 0.15
    - relatos (gravidade×recência) 0.30  (Regras 4 e 5)

Saída: score, nível, explicação textual, recomendações e o detalhamento dos
fatores (para auditoria/transparência na interface).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone

from ..models.enums import ReportSeverity, RiskLevel

# ---------------------------------------------------------------------------
# Parâmetros do modelo (centralizados e documentados para fácil ajuste/pitch)
# ---------------------------------------------------------------------------

WEIGHTS: dict[str, float] = {
    "rain_72h": 0.30,
    "forecast_7d": 0.25,
    "slope": 0.15,
    "reports": 0.30,
}

# Valores de referência onde cada fator satura em 100 (sub-score máximo).
REF_RAIN_72H_MM = 100.0     # 100 mm em 72h já é chuva muito forte
REF_FORECAST_7D_MM = 150.0  # 150 mm na semana satura o alerta preventivo
REF_SLOPE_PCT = 10.0        # 10% de declividade é considerado acentuado

# Pontos-base por severidade de denúncia (antes do decaimento por recência).
SEVERITY_POINTS: dict[str, float] = {
    ReportSeverity.BAIXA.value: 15.0,
    ReportSeverity.MEDIA.value: 30.0,
    ReportSeverity.ALTA.value: 45.0,
    ReportSeverity.CRITICA.value: 60.0,
}

# Janela de decaimento linear da recência: relato com N dias perde relevância
# proporcionalmente; acima de RECENCY_WINDOW_DAYS não pesa mais (Regra 5).
RECENCY_WINDOW_DAYS = 14.0

# Faixas score -> nível (Seção 6.3).
LEVEL_THRESHOLDS = [
    (75.0, RiskLevel.CRITICO),
    (50.0, RiskLevel.ALTO),
    (25.0, RiskLevel.MEDIO),
    (0.0, RiskLevel.BAIXO),
]


# ---------------------------------------------------------------------------
# Estruturas de resultado
# ---------------------------------------------------------------------------

@dataclass
class FactorBreakdown:
    """Contribuição de um fator para o score final (transparência)."""
    key: str
    label: str
    value: float          # valor bruto do fator (mm, %, etc.)
    subscore: float       # 0-100 após normalização
    weight: float         # peso do fator
    contribution: float   # subscore * weight (pontos no score final)


@dataclass
class ScoreResult:
    """Resultado completo do cálculo do Índice de Trafegabilidade."""
    score: float
    level: RiskLevel
    explanation: str
    recommendations: list[str]
    factors: list[FactorBreakdown] = field(default_factory=list)

    def as_dict(self) -> dict:
        return {
            "score": self.score,
            "level": self.level.value,
            "explanation": self.explanation,
            "recommendations": self.recommendations,
            "factors": [f.__dict__ for f in self.factors],
        }


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    """Limita um valor ao intervalo [low, high]."""
    return max(low, min(high, value))


def score_to_level(score: float) -> RiskLevel:
    """Converte o score 0-100 no nível textual de risco (Seção 6.3)."""
    for threshold, level in LEVEL_THRESHOLDS:
        if score >= threshold:
            return level
    return RiskLevel.BAIXO


def _parse_dt(value) -> datetime | None:
    """Aceita datetime ou string ISO; retorna datetime tz-aware (UTC)."""
    if value is None:
        return None
    if isinstance(value, datetime):
        dt = value
    else:
        try:
            dt = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except ValueError:
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def _recency_factor(created_at, now: datetime) -> float:
    """
    Fator de recência (1.0 = agora, 0.0 = além da janela) por decaimento linear.

    Relatos recentes pesam mais que antigos (Regra de Negócio 5).
    """
    dt = _parse_dt(created_at)
    if dt is None:
        return 1.0  # sem data: assume recente
    age_days = (now - dt).total_seconds() / 86400.0
    return _clamp(1.0 - age_days / RECENCY_WINDOW_DAYS, 0.0, 1.0)


def _reports_subscore(reports: list[dict], now: datetime) -> tuple[float, int, list[str]]:
    """
    Sub-score 0-100 dos relatos: soma (gravidade × recência), saturando em 100.

    Retorna também a contagem de relatos relevantes (recentes) e as categorias
    distintas presentes, usadas na explicação textual.
    """
    total = 0.0
    recent_count = 0
    categories: list[str] = []
    for r in reports or []:
        severity = (r.get("severity") or ReportSeverity.MEDIA.value)
        base = SEVERITY_POINTS.get(str(severity), SEVERITY_POINTS[ReportSeverity.MEDIA.value])
        factor = _recency_factor(r.get("created_at"), now)
        contribution = base * factor
        total += contribution
        if factor > 0:  # ainda dentro da janela de recência
            recent_count += 1
            cat = r.get("category")
            if cat and str(cat) not in categories:
                categories.append(str(cat))
    return _clamp(total), recent_count, categories


# ---------------------------------------------------------------------------
# Geração de explicação e recomendações
# ---------------------------------------------------------------------------

_CATEGORY_LABELS = {
    "buraco": "buraco",
    "lama": "lama",
    "erosao": "erosão",
    "ponte_danificada": "ponte danificada",
    "atolamento": "atolamento",
    "outro": "outro problema",
}


def _join_pt(items: list[str]) -> str:
    """Junta itens em português: ['a','b','c'] -> 'a, b e c'."""
    items = [i for i in items if i]
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + " e " + items[-1]


def _phrase_rain72(value: float) -> str:
    return f"chuva acumulada de {value:.0f} mm nas últimas 72h"


def _phrase_forecast(value: float) -> str:
    if value >= 100:
        return f"previsão de chuva intensa ({value:.0f} mm) para os próximos 7 dias"
    if value >= 50:
        return f"previsão de chuva moderada ({value:.0f} mm) para os próximos 7 dias"
    return f"previsão de {value:.0f} mm de chuva para os próximos 7 dias"


def _phrase_slope(value: float) -> str:
    if value >= 7:
        return f"declividade acentuada de {value:.1f}%"
    if value >= 4:
        return f"declividade de {value:.1f}%"
    return f"declividade suave de {value:.1f}%"


def _phrase_reports(count: int, categories: list[str]) -> str:
    plural = "s" if count != 1 else ""
    base = f"{count} relato{plural} recente{plural}"
    cats = [_CATEGORY_LABELS.get(c, c) for c in categories]
    if cats:
        return f"{base} de {_join_pt(cats)}"
    return base


def _build_explanation(level: RiskLevel, factors: list[FactorBreakdown],
                       report_count: int, report_categories: list[str]) -> str:
    """
    Monta a justificativa textual destacando os fatores de maior contribuição
    (Regra de Negócio 3). Ex.: "Risco alto devido a chuva acumulada de 78 mm
    nas últimas 72h, previsão de chuva intensa ... e 3 relatos recentes ...".
    """
    # Constrói a frase de cada fator com contribuição relevante (> 2 pontos).
    phrased: list[tuple[float, str]] = []
    for f in factors:
        if f.contribution < 2.0:
            continue
        if f.key == "rain_72h":
            phrased.append((f.contribution, _phrase_rain72(f.value)))
        elif f.key == "forecast_7d":
            phrased.append((f.contribution, _phrase_forecast(f.value)))
        elif f.key == "slope":
            phrased.append((f.contribution, _phrase_slope(f.value)))
        elif f.key == "reports" and report_count > 0:
            phrased.append((f.contribution, _phrase_reports(report_count, report_categories)))

    phrased.sort(key=lambda x: x[0], reverse=True)
    top = [p[1] for p in phrased[:3]]

    nivel = level.value
    if not top:
        return f"Risco {nivel}: condições estáveis e sem relatos recentes; trafegabilidade normal."
    return f"Risco {nivel} devido a {_join_pt(top)}."


def _build_recommendations(level: RiskLevel, factors: list[FactorBreakdown],
                           report_count: int) -> list[str]:
    """Recomendações de ação por nível, com itens condicionais aos fatores."""
    recs: list[str] = []
    if level == RiskLevel.CRITICO:
        recs += [
            "Acionar a equipe de manutenção em caráter de urgência.",
            "Sinalizar o trecho e orientar rotas alternativas.",
            "Evitar o tráfego de caminhões pesados até a vistoria.",
        ]
    elif level == RiskLevel.ALTO:
        recs += [
            "Programar manutenção preventiva nos próximos dias.",
            "Monitorar a evolução da chuva e novos relatos.",
        ]
    elif level == RiskLevel.MEDIO:
        recs += [
            "Manter o trecho sob monitoramento.",
            "Planejar manutenção preventiva conforme a previsão de chuva.",
        ]
    else:  # BAIXO
        recs += ["Trecho transitável; manter acompanhamento de rotina."]

    # Recomendações condicionais ao fator dominante.
    by_key = {f.key: f for f in factors}
    if by_key.get("slope") and by_key["slope"].value >= 7 and level != RiskLevel.BAIXO:
        recs.append("Reforçar drenagem e contenção de erosão no trecho íngreme.")
    if report_count >= 3:
        recs.append("Priorizar vistoria de campo devido ao alto número de relatos.")
    return recs


# ---------------------------------------------------------------------------
# Função principal
# ---------------------------------------------------------------------------

def calculate_traffic_index(
    *,
    accumulated_rain_72h: float = 0.0,
    forecast_rain_7d: float = 0.0,
    slope: float = 0.0,
    reports: list[dict] | None = None,
    now: datetime | None = None,
) -> ScoreResult:
    """
    Calcula o Índice de Trafegabilidade (0-100) de um trecho de forma explicável.

    Args:
        accumulated_rain_72h: chuva acumulada nas últimas 72h (mm).
        forecast_rain_7d: chuva total prevista para os próximos 7 dias (mm).
        slope: declividade média do trecho (%).
        reports: lista de denúncias (cada uma com 'severity', 'category',
            'created_at'); severidade e recência influenciam o peso.
        now: instante de referência (default: agora, UTC) — facilita testes.

    Returns:
        ScoreResult com score, nível, explicação, recomendações e fatores.
    """
    now = now or datetime.now(timezone.utc)
    reports = reports or []

    # 1) Normalização de cada fator para sub-score 0-100.
    sub_rain72 = _clamp(accumulated_rain_72h / REF_RAIN_72H_MM * 100.0)
    sub_forecast = _clamp(forecast_rain_7d / REF_FORECAST_7D_MM * 100.0)
    sub_slope = _clamp(slope / REF_SLOPE_PCT * 100.0)
    sub_reports, recent_count, categories = _reports_subscore(reports, now)

    # 2) Detalhamento por fator (contribuição = subscore * peso).
    factors = [
        FactorBreakdown("rain_72h", "Chuva acumulada (72h)", accumulated_rain_72h,
                        round(sub_rain72, 1), WEIGHTS["rain_72h"],
                        round(sub_rain72 * WEIGHTS["rain_72h"], 1)),
        FactorBreakdown("forecast_7d", "Previsão de chuva (7 dias)", forecast_rain_7d,
                        round(sub_forecast, 1), WEIGHTS["forecast_7d"],
                        round(sub_forecast * WEIGHTS["forecast_7d"], 1)),
        FactorBreakdown("slope", "Declividade", slope,
                        round(sub_slope, 1), WEIGHTS["slope"],
                        round(sub_slope * WEIGHTS["slope"], 1)),
        FactorBreakdown("reports", "Relatos da comunidade", float(recent_count),
                        round(sub_reports, 1), WEIGHTS["reports"],
                        round(sub_reports * WEIGHTS["reports"], 1)),
    ]

    # 3) Score final = soma das contribuições, limitado a [0, 100].
    score = _clamp(sum(f.contribution for f in factors))
    score = round(score, 1)
    level = score_to_level(score)

    # 4) Explicação e recomendações.
    explanation = _build_explanation(level, factors, recent_count, categories)
    recommendations = _build_recommendations(level, factors, recent_count)

    return ScoreResult(
        score=score,
        level=level,
        explanation=explanation,
        recommendations=recommendations,
        factors=factors,
    )
