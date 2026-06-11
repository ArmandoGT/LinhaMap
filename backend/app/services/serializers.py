"""
Serializadores: transformam os registros do repositório no formato da API.

Centralizam a construção da geometria (GeoJSON) e o enriquecimento do detalhe
do trecho com a análise do motor de scoring (recomendações + fatores).
"""

from .scoring import calculate_traffic_index


def build_geometry(segment: dict) -> dict | None:
    """Monta um GeoJSON LineString a partir das coordenadas [[lon,lat], ...]."""
    coords = segment.get("coordinates")
    if not coords:
        return None
    return {"type": "LineString", "coordinates": coords}


def serialize_segment(segment: dict) -> dict:
    """Versão de lista/mapa: registro do trecho + geometria GeoJSON."""
    out = dict(segment)
    out["geometry"] = build_geometry(segment)
    return out


def serialize_segment_detail(segment: dict, reports: list[dict]) -> dict:
    """
    Versão detalhada (painel lateral): recalcula a análise ao vivo para
    garantir coerência entre score, explicação, recomendações e fatores.
    """
    result = calculate_traffic_index(
        accumulated_rain_72h=segment.get("accumulated_rain_72h", 0) or 0,
        forecast_rain_7d=segment.get("forecast_rain_7d", 0) or 0,
        slope=segment.get("slope", 0) or 0,
        reports=reports,
    )
    out = serialize_segment(segment)
    # A análise ao vivo é a fonte da verdade para o painel.
    out["risk_score"] = result.score
    out["risk_level"] = result.level.value
    out["explanation"] = result.explanation
    out["recommendations"] = result.recommendations
    out["factors"] = [f.__dict__ for f in result.factors]
    return out
