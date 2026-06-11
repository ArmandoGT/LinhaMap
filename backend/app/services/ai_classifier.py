"""
Classificação automática de denúncias (Seção 6.5).

Estratégia em dois níveis, sempre retornando o mesmo contrato JSON:
    {"categoria", "severidade", "confianca", "justificativa", "fonte"}

1. IA multimodal (Claude) — quando ENABLE_AI_CLASSIFICATION=true e há chave:
   analisa descrição + imagem e devolve a classificação.
2. Fallback por regras — quando não há IA: casa palavras-chave da descrição.
   Garante que o sistema funcione sem chaves externas (Regra de Negócio 10).
"""

from __future__ import annotations

import json
import unicodedata

from ..config import get_settings
from ..models.enums import ReportCategory, ReportSeverity

# ---------------------------------------------------------------------------
# Regras (fallback determinístico)
# ---------------------------------------------------------------------------

# Ordem de prioridade na checagem de categoria (mais grave/específico primeiro).
_CATEGORY_KEYWORDS: list[tuple[str, list[str]]] = [
    (ReportCategory.PONTE_DANIFICADA.value, ["ponte", "cabeceira", "bueiro", "pontilhao"]),
    (ReportCategory.ATOLAMENTO.value, ["atol", "atolou", "atolamento", "preso no barro"]),
    (ReportCategory.EROSAO.value, ["erosao", "voçoroca", "vossoroca", "barranco caiu", "deslizamento"]),
    (ReportCategory.LAMA.value, ["lama", "lamacal", "atoleiro", "barro"]),
    (ReportCategory.BURACO.value, ["buraco", "cratera", "afundou", "afundamento"]),
]

_SEVERITY_KEYWORDS: list[tuple[str, list[str]]] = [
    (ReportSeverity.CRITICA.value, ["grave", "critic", "urgente", "intransit", "cedendo", "desabou", "destru", "isolad"]),
    (ReportSeverity.ALTA.value, ["forte", "grande", "perigos", "fundo", "profund", "piorando", "crescendo"]),
    (ReportSeverity.BAIXA.value, ["leve", "pequen", "comeca", "inicio", "da pra", "ainda passa", "desviar"]),
]


def _normalize(text: str) -> str:
    """Minúsculas e sem acentos, para casar palavras-chave de forma robusta."""
    text = text.lower()
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c))


_CATEGORY_LABELS = {
    "buraco": "buraco", "lama": "lama", "erosao": "erosão",
    "ponte_danificada": "ponte danificada", "atolamento": "atolamento",
    "outro": "outro problema",
}


def classify_by_rules(description: str | None) -> dict:
    """Classificação por palavras-chave (sempre disponível)."""
    text = _normalize(description or "")

    category = ReportCategory.OUTRO.value
    matched_kw = None
    for cat, keywords in _CATEGORY_KEYWORDS:
        hit = next((kw for kw in keywords if kw in text), None)
        if hit:
            category, matched_kw = cat, hit
            break

    severity = ReportSeverity.MEDIA.value
    for sev, keywords in _SEVERITY_KEYWORDS:
        if any(kw in text for kw in keywords):
            severity = sev
            break

    if matched_kw:
        confidence = 0.6
        justificativa = (
            f"Classificação por regras: a descrição menciona '{matched_kw}', "
            f"indicando {_CATEGORY_LABELS.get(category, category)}."
        )
    else:
        confidence = 0.4
        justificativa = (
            "Classificação por regras: nenhuma palavra-chave específica encontrada; "
            "categorizado como 'outro'."
        )

    return {
        "categoria": category,
        "severidade": severity,
        "confianca": confidence,
        "justificativa": justificativa,
        "fonte": "regras",
    }


# ---------------------------------------------------------------------------
# IA multimodal (Claude)
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = (
    "Você é um classificador de ocorrências em estradas rurais (linhas vicinais). "
    "Analise a descrição e a imagem (se houver) e responda APENAS com um JSON válido, "
    "sem texto extra, no formato exato:\n"
    '{"categoria": "<buraco|lama|erosao|ponte_danificada|atolamento|outro>", '
    '"severidade": "<baixa|media|alta|critica>", '
    '"confianca": <numero entre 0 e 1>, '
    '"justificativa": "<frase curta explicando a classificação>"}'
)


def _extract_json(text: str) -> dict | None:
    """Extrai o primeiro objeto JSON de uma resposta de texto."""
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1 or end < start:
        return None
    try:
        return json.loads(text[start:end + 1])
    except json.JSONDecodeError:
        return None


def _validate(parsed: dict) -> dict | None:
    """Valida categoria/severidade contra os enums; normaliza a saída."""
    try:
        categoria = ReportCategory(parsed["categoria"]).value
        severidade = ReportSeverity(parsed["severidade"]).value
    except (KeyError, ValueError):
        return None
    confianca = float(parsed.get("confianca", 0.7))
    confianca = max(0.0, min(1.0, confianca))
    return {
        "categoria": categoria,
        "severidade": severidade,
        "confianca": round(confianca, 2),
        "justificativa": str(parsed.get("justificativa", "")) or "Classificação por IA.",
        "fonte": "ia",
    }


def classify_with_ai(description: str | None, image_url: str | None) -> dict | None:
    """Tenta classificar via Claude; retorna None se indisponível/erro (=> fallback)."""
    settings = get_settings()
    if not settings.ai_enabled:
        return None
    try:
        import anthropic  # import tardio: só carrega quando a IA está ligada

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

        content: list[dict] = [{
            "type": "text",
            "text": f"Descrição da denúncia: {description or '(sem descrição)'}",
        }]
        if image_url:
            content.append({"type": "image", "source": {"type": "url", "url": image_url}})

        message = client.messages.create(
            model=settings.ai_model_classify,
            max_tokens=300,
            system=_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": content}],
        )
        raw = "".join(block.text for block in message.content if getattr(block, "type", None) == "text")
        parsed = _extract_json(raw)
        return _validate(parsed) if parsed else None
    except Exception:  # noqa: BLE001 - qualquer falha cai no fallback por regras
        return None


# ---------------------------------------------------------------------------
# Função pública
# ---------------------------------------------------------------------------

def classify_report(description: str | None = None, image_url: str | None = None) -> dict:
    """
    Classifica uma denúncia, preferindo IA e caindo para regras.

    Retorna sempre: {categoria, severidade, confianca, justificativa, fonte}.
    """
    ai_result = classify_with_ai(description, image_url)
    if ai_result is not None:
        return ai_result
    return classify_by_rules(description)
