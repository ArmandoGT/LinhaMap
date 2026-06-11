"""
Relatório semanal para a Secretaria de Obras (Seções 6.7 e 6.6).

`build_weekly_data` agrega os números (reutilizado pelo dashboard na Etapa 6) e
`generate_weekly_summary_text` produz o texto — via Claude se disponível, ou por
lógica simples caso contrário (Seção 5-IA-3 / Regra de Negócio 10).
"""

from __future__ import annotations

from ..config import get_settings

_CATEGORY_LABELS = {
    "buraco": "buraco", "lama": "lama", "erosao": "erosão",
    "ponte_danificada": "ponte danificada", "atolamento": "atolamento",
    "outro": "outro",
}


# ---------------------------------------------------------------------------
# Agregação dos dados
# ---------------------------------------------------------------------------

def build_weekly_data(segments: list[dict], reports: list[dict]) -> dict:
    """Consolida os indicadores da semana a partir de trechos e denúncias."""
    seg_line = {str(s["id"]): s.get("rural_line") for s in segments}

    critical = sorted(
        [s for s in segments if s.get("risk_level") in ("alto", "critico")],
        key=lambda s: s.get("risk_score", 0), reverse=True,
    )
    critical_segments = [
        {
            "name": s.get("name"), "rural_line": s.get("rural_line"),
            "risk_level": s.get("risk_level"), "risk_score": s.get("risk_score"),
        }
        for s in critical[:5]
    ]

    reports_by_category: dict[str, int] = {}
    affected: dict[str, int] = {}
    for r in reports:
        cat = r.get("category", "outro")
        reports_by_category[cat] = reports_by_category.get(cat, 0) + 1
        line = seg_line.get(str(r.get("road_segment_id")))
        if line:
            affected[line] = affected.get(line, 0) + 1

    affected_regions = [
        {"rural_line": line, "count": n}
        for line, n in sorted(affected.items(), key=lambda kv: kv[1], reverse=True)
    ]

    scores = [s.get("risk_score", 0) for s in segments]
    avg_index = round(sum(scores) / len(scores), 1) if scores else 0

    priority = [
        f"Priorizar {s['name']} ({s['rural_line']}) — risco {s['risk_level']} "
        f"(índice {s['risk_score']:.0f})."
        for s in critical_segments[:3]
    ]

    return {
        "total_segments": len(segments),
        "critical_count": sum(1 for s in segments if s.get("risk_level") == "critico"),
        "high_count": sum(1 for s in segments if s.get("risk_level") == "alto"),
        "average_index": avg_index,
        "critical_segments": critical_segments,
        "reports_by_category": reports_by_category,
        "affected_regions": affected_regions,
        "reports_total": len(reports),
        "reports_open": sum(1 for r in reports if r.get("status") == "aberta"),
        "reports_in_analysis": sum(1 for r in reports if r.get("status") == "em_analise"),
        "reports_resolved": sum(1 for r in reports if r.get("status") == "resolvida"),
        "priority_recommendations": priority,
    }


# ---------------------------------------------------------------------------
# Texto do resumo
# ---------------------------------------------------------------------------

def _render_text_by_rules(data: dict) -> str:
    """Resumo textual por lógica simples — pronto para ata/ofício."""
    linhas: list[str] = []
    linhas.append(
        f"Relatório semanal de trafegabilidade rural — Ariquemes/RO. "
        f"No período, {data['total_segments']} trechos foram monitorados, sendo "
        f"{data['critical_count']} em nível crítico e {data['high_count']} em nível alto. "
        f"O índice médio de trafegabilidade foi de {data['average_index']}/100."
    )

    if data["critical_segments"]:
        nomes = "; ".join(
            f"{s['name']} ({s['rural_line']}), risco {s['risk_level']}"
            for s in data["critical_segments"]
        )
        linhas.append(f"Trechos que exigem atenção prioritária: {nomes}.")

    if data["reports_by_category"]:
        cats = ", ".join(
            f"{n} de {_CATEGORY_LABELS.get(c, c)}"
            for c, n in sorted(data["reports_by_category"].items(), key=lambda kv: kv[1], reverse=True)
        )
        linhas.append(
            f"Foram registradas {data['reports_total']} ocorrências "
            f"({data['reports_open']} abertas, {data['reports_resolved']} resolvidas), "
            f"distribuídas por categoria: {cats}."
        )

    if data["affected_regions"]:
        regioes = ", ".join(f"{r['rural_line']} ({r['count']})" for r in data["affected_regions"][:5])
        linhas.append(f"Regiões mais afetadas por número de relatos: {regioes}.")

    if data["priority_recommendations"]:
        linhas.append("Recomendações de prioridade: " + " ".join(data["priority_recommendations"]))

    return "\n\n".join(linhas)


def _render_text_with_ai(data: dict) -> str | None:
    """Gera um resumo mais fluido via Claude; None em caso de indisponibilidade."""
    settings = get_settings()
    if not settings.ai_enabled:
        return None
    try:
        import json

        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        message = client.messages.create(
            model=settings.ai_model_report,
            max_tokens=600,
            system=(
                "Você redige relatórios oficiais para a Secretaria de Obras. "
                "Escreva um resumo semanal claro, objetivo e em tom institucional, "
                "pronto para ata ou ofício, em português do Brasil. Use os dados "
                "fornecidos; não invente números."
            ),
            messages=[{
                "role": "user",
                "content": (
                    "Gere o resumo semanal de trafegabilidade rural a partir destes dados "
                    f"(JSON):\n\n{json.dumps(data, ensure_ascii=False, indent=2)}"
                ),
            }],
        )
        text = "".join(b.text for b in message.content if getattr(b, "type", None) == "text").strip()
        return text or None
    except Exception:  # noqa: BLE001
        return None


def generate_weekly_summary(segments: list[dict], reports: list[dict]) -> dict:
    """Monta os dados e o texto do relatório semanal."""
    data = build_weekly_data(segments, reports)
    ai_text = _render_text_with_ai(data)
    if ai_text:
        return {"summary": ai_text, "generated_by": "ia", "data": data}
    return {"summary": _render_text_by_rules(data), "generated_by": "regras", "data": data}
