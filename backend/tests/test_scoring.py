"""
Testes do motor do Índice de Trafegabilidade (app/services/scoring.py).

Cobrem: faixas score->nível, limites 0-100, monotonicidade dos fatores,
peso da recência/severidade dos relatos e a explicabilidade (a explicação
cita os fatores dominantes e há recomendações).
"""

from datetime import datetime, timedelta, timezone

from app.models.enums import RiskLevel
from app.services.scoring import (
    calculate_traffic_index,
    score_to_level,
)

NOW = datetime(2026, 6, 11, 12, 0, 0, tzinfo=timezone.utc)


def _report(severity="alta", category="lama", days_ago=1):
    return {
        "severity": severity,
        "category": category,
        "created_at": (NOW - timedelta(days=days_ago)).isoformat(),
    }


# --- Conversão score -> nível (Seção 6.3) ----------------------------------

def test_score_to_level_faixas():
    assert score_to_level(0) == RiskLevel.BAIXO
    assert score_to_level(24) == RiskLevel.BAIXO
    assert score_to_level(25) == RiskLevel.MEDIO
    assert score_to_level(49) == RiskLevel.MEDIO
    assert score_to_level(50) == RiskLevel.ALTO
    assert score_to_level(74) == RiskLevel.ALTO
    assert score_to_level(75) == RiskLevel.CRITICO
    assert score_to_level(100) == RiskLevel.CRITICO


# --- Limites e casos extremos ----------------------------------------------

def test_trecho_seco_sem_relatos_e_baixo():
    r = calculate_traffic_index(
        accumulated_rain_72h=0, forecast_rain_7d=0, slope=0, reports=[], now=NOW
    )
    assert r.score == 0
    assert r.level == RiskLevel.BAIXO
    assert 0 <= r.score <= 100
    assert r.recommendations  # sempre há ao menos uma recomendação


def test_score_nunca_passa_de_100():
    r = calculate_traffic_index(
        accumulated_rain_72h=999, forecast_rain_7d=999, slope=99,
        reports=[_report("critica", "atolamento", 0) for _ in range(10)], now=NOW
    )
    assert r.score == 100
    assert r.level == RiskLevel.CRITICO


# --- Monotonicidade (mais chuva/declividade/relatos => maior risco) --------

def test_mais_chuva_72h_aumenta_score():
    baixo = calculate_traffic_index(accumulated_rain_72h=10, now=NOW).score
    alto = calculate_traffic_index(accumulated_rain_72h=90, now=NOW).score
    assert alto > baixo


def test_relato_critico_aumenta_o_risco():
    sem = calculate_traffic_index(accumulated_rain_72h=30, reports=[], now=NOW).score
    com = calculate_traffic_index(
        accumulated_rain_72h=30, reports=[_report("critica", "atolamento", 0)], now=NOW
    ).score
    assert com > sem  # Regra de Negócio 4


def test_relato_recente_pesa_mais_que_antigo():
    recente = calculate_traffic_index(reports=[_report("alta", "lama", 0)], now=NOW).score
    antigo = calculate_traffic_index(reports=[_report("alta", "lama", 13)], now=NOW).score
    assert recente > antigo  # Regra de Negócio 5


def test_relato_fora_da_janela_nao_pesa():
    r = calculate_traffic_index(reports=[_report("critica", "lama", 30)], now=NOW)
    # 30 dias > janela de 14 dias => contribuição zero dos relatos
    reports_factor = next(f for f in r.factors if f.key == "reports")
    assert reports_factor.subscore == 0


# --- Explicabilidade (Regra de Negócio 3) ----------------------------------

def test_explicacao_cita_fatores_dominantes():
    r = calculate_traffic_index(
        accumulated_rain_72h=78, forecast_rain_7d=120, slope=8,
        reports=[_report("alta", "lama", 1), _report("critica", "atolamento", 1)],
        now=NOW,
    )
    assert r.level in (RiskLevel.ALTO, RiskLevel.CRITICO)
    assert "Risco" in r.explanation
    assert "72h" in r.explanation
    assert "relato" in r.explanation
    # categorias aparecem traduzidas
    assert "lama" in r.explanation or "atolamento" in r.explanation


def test_factor_breakdown_soma_aproxima_score():
    r = calculate_traffic_index(
        accumulated_rain_72h=64, forecast_rain_7d=95, slope=5.1,
        reports=[_report("alta", "buraco", 2)], now=NOW,
    )
    soma = round(sum(f.contribution for f in r.factors), 1)
    assert abs(soma - r.score) <= 0.5  # tolerância de arredondamento


if __name__ == "__main__":  # permite rodar sem pytest: python -m tests.test_scoring
    import sys
    import traceback

    funcs = [v for k, v in sorted(globals().items()) if k.startswith("test_") and callable(v)]
    falhas = 0
    for fn in funcs:
        try:
            fn()
            print(f"PASS  {fn.__name__}")
        except Exception:  # noqa: BLE001
            falhas += 1
            print(f"FAIL  {fn.__name__}")
            traceback.print_exc()
    print(f"\n{len(funcs) - falhas}/{len(funcs)} testes passaram.")
    sys.exit(1 if falhas else 0)
