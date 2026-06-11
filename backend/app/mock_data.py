"""
Dados mockados de Ariquemes/RO (espelho de database/seed.sql).

Permitem que a API funcione sem Supabase (ENABLE_MOCK_DATA=true), garantindo
o MVP no ar desde o primeiro dia (Regra de Negócio 10). Os serviços da Etapa 4
consumirão estas listas como repositório em memória.

Obs.: `coordinates` está no formato [lon, lat] (padrão GeoJSON).
"""

from datetime import datetime, timedelta, timezone


def _hours_ago(h: int) -> str:
    """Timestamp ISO de N horas atrás (referência fixa relativa à carga)."""
    return (datetime.now(timezone.utc) - timedelta(hours=h)).isoformat()


# --- 8 trechos cobrindo os 4 níveis de risco ------------------------------
MOCK_SEGMENTS: list[dict] = [
    {
        "id": "11111111-1111-1111-1111-000000000001",
        "name": "Trecho Ponte do Branco", "rural_line": "Linha C-65",
        "coordinates": [[-63.110, -9.870], [-63.118, -9.878], [-63.125, -9.884]],
        "latitude": -9.878, "longitude": -63.118, "slope": 8.5,
        "accumulated_rain_72h": 92.0, "forecast_rain_7d": 140.0,
        "forecast_daily": [{"date": f"D+{i}", "mm": v} for i, v in enumerate([28, 34, 22, 18, 15, 12, 11], start=1)],
        "reports_count": 4, "risk_score": 86.0, "risk_level": "critico",
        "explanation": "Risco crítico: chuva acumulada de 92 mm em 72h, previsão de chuva intensa (140 mm em 7 dias), declividade elevada de 8,5% e 4 relatos recentes de lama e atolamento.",
    },
    {
        "id": "11111111-1111-1111-1111-000000000007",
        "name": "Trecho Atravessa Igarapé", "rural_line": "Ramal dos Peixes",
        "coordinates": [[-63.050, -10.010], [-63.058, -10.018], [-63.064, -10.027]],
        "latitude": -10.018, "longitude": -63.058, "slope": 6.2,
        "accumulated_rain_72h": 88.0, "forecast_rain_7d": 122.0,
        "forecast_daily": [{"date": f"D+{i}", "mm": v} for i, v in enumerate([24, 30, 20, 16, 12, 10, 10], start=1)],
        "reports_count": 3, "risk_score": 79.0, "risk_level": "critico",
        "explanation": "Risco crítico: ponte sobre igarapé com 3 relatos recentes, chuva acumulada de 88 mm e previsão de 122 mm para a semana comprometem a travessia de caminhões de peixe.",
    },
    {
        "id": "11111111-1111-1111-1111-000000000002",
        "name": "Trecho Igarapé Verde", "rural_line": "Linha C-70",
        "coordinates": [[-63.000, -9.930], [-63.008, -9.938], [-63.015, -9.945]],
        "latitude": -9.938, "longitude": -63.008, "slope": 5.1,
        "accumulated_rain_72h": 64.0, "forecast_rain_7d": 95.0,
        "forecast_daily": [{"date": f"D+{i}", "mm": v} for i, v in enumerate([18, 20, 16, 14, 10, 9, 8], start=1)],
        "reports_count": 2, "risk_score": 66.0, "risk_level": "alto",
        "explanation": "Risco alto: chuva acumulada de 64 mm em 72h e previsão de 95 mm para os próximos dias, com 2 relatos recentes de buraco e erosão.",
    },
    {
        "id": "11111111-1111-1111-1111-000000000005",
        "name": "Trecho Travessão 40", "rural_line": "Linha TB-40",
        "coordinates": [[-63.150, -9.960], [-63.158, -9.968], [-63.166, -9.975]],
        "latitude": -9.968, "longitude": -63.158, "slope": 7.3,
        "accumulated_rain_72h": 58.0, "forecast_rain_7d": 88.0,
        "forecast_daily": [{"date": f"D+{i}", "mm": v} for i, v in enumerate([16, 18, 15, 13, 11, 8, 7], start=1)],
        "reports_count": 2, "risk_score": 70.0, "risk_level": "alto",
        "explanation": "Risco alto: declividade de 7,3% acelera a erosão; chuva acumulada de 58 mm e 2 relatos recentes elevam a probabilidade de atolamento.",
    },
    {
        "id": "11111111-1111-1111-1111-000000000003",
        "name": "Trecho Sítio Boa Vista", "rural_line": "Linha C-60",
        "coordinates": [[-62.980, -9.890], [-62.988, -9.897], [-62.995, -9.903]],
        "latitude": -9.897, "longitude": -62.988, "slope": 3.4,
        "accumulated_rain_72h": 36.0, "forecast_rain_7d": 52.0,
        "forecast_daily": [{"date": f"D+{i}", "mm": v} for i, v in enumerate([10, 9, 8, 7, 6, 6, 6], start=1)],
        "reports_count": 1, "risk_score": 38.0, "risk_level": "medio",
        "explanation": "Risco médio: chuva acumulada moderada (36 mm) e previsão de 52 mm; 1 relato recente. Trecho exige atenção, mas ainda transitável.",
    },
    {
        "id": "11111111-1111-1111-1111-000000000006",
        "name": "Trecho Cafezal Alto", "rural_line": "Ramal do Café",
        "coordinates": [[-63.080, -9.840], [-63.086, -9.847], [-63.092, -9.853]],
        "latitude": -9.847, "longitude": -63.086, "slope": 4.6,
        "accumulated_rain_72h": 30.0, "forecast_rain_7d": 48.0,
        "forecast_daily": [{"date": f"D+{i}", "mm": v} for i, v in enumerate([9, 8, 8, 7, 6, 5, 5], start=1)],
        "reports_count": 1, "risk_score": 45.0, "risk_level": "medio",
        "explanation": "Risco médio: declividade de 4,6% e chuva acumulada de 30 mm; 1 relato de buraco. Recomenda-se monitorar antes do escoamento do café.",
    },
    {
        "id": "11111111-1111-1111-1111-000000000004",
        "name": "Trecho Laticínio", "rural_line": "Linha C-75",
        "coordinates": [[-62.950, -9.950], [-62.957, -9.957], [-62.963, -9.963]],
        "latitude": -9.957, "longitude": -62.957, "slope": 2.1,
        "accumulated_rain_72h": 12.0, "forecast_rain_7d": 22.0,
        "forecast_daily": [{"date": f"D+{i}", "mm": v} for i, v in enumerate([4, 3, 3, 3, 3, 3, 3], start=1)],
        "reports_count": 0, "risk_score": 15.0, "risk_level": "baixo",
        "explanation": "Risco baixo: chuva acumulada de apenas 12 mm, previsão fraca (22 mm) e declividade suave de 2,1%. Sem relatos recentes.",
    },
    {
        "id": "11111111-1111-1111-1111-000000000008",
        "name": "Trecho Curva da Serra", "rural_line": "Linha C-65",
        "coordinates": [[-63.100, -9.900], [-63.107, -9.906], [-63.113, -9.912]],
        "latitude": -9.906, "longitude": -63.107, "slope": 3.0,
        "accumulated_rain_72h": 18.0, "forecast_rain_7d": 28.0,
        "forecast_daily": [{"date": f"D+{i}", "mm": v} for i, v in enumerate([5, 5, 4, 4, 4, 3, 3], start=1)],
        "reports_count": 0, "risk_score": 21.0, "risk_level": "baixo",
        "explanation": "Risco baixo: condições estáveis, chuva acumulada de 18 mm e previsão de 28 mm. Sem relatos recentes; trafegabilidade normal.",
    },
]


# --- 6 denúncias de exemplo -----------------------------------------------
MOCK_REPORTS: list[dict] = [
    {
        "id": "22222222-2222-2222-2222-000000000001",
        "reporter_name": "João Ferreira", "phone": "(69) 99999-1001",
        "road_segment_id": "11111111-1111-1111-1111-000000000001",
        "latitude": -9.879, "longitude": -63.119,
        "description": "Muita lama na descida da ponte, caminhão do leite quase atolou.",
        "image_url": None, "category": "lama", "severity": "critica",
        "confidence": 0.91, "status": "aberta", "created_at": _hours_ago(24),
    },
    {
        "id": "22222222-2222-2222-2222-000000000002",
        "reporter_name": "Maria Souza", "phone": "(69) 99999-1002",
        "road_segment_id": "11111111-1111-1111-1111-000000000001",
        "latitude": -9.877, "longitude": -63.117,
        "description": "Buraco grande perto da ponte, está crescendo com a chuva.",
        "image_url": None, "category": "buraco", "severity": "alta",
        "confidence": 0.84, "status": "em_analise", "created_at": _hours_ago(48),
    },
    {
        "id": "22222222-2222-2222-2222-000000000003",
        "reporter_name": "Cooperativa Leite Bom", "phone": "(69) 99999-1003",
        "road_segment_id": "11111111-1111-1111-1111-000000000007",
        "latitude": -10.019, "longitude": -63.059,
        "description": "Cabeceira da ponte cedendo, perigoso para caminhão de peixe.",
        "image_url": None, "category": "ponte_danificada", "severity": "critica",
        "confidence": 0.88, "status": "aberta", "created_at": _hours_ago(24),
    },
    {
        "id": "22222222-2222-2222-2222-000000000004",
        "reporter_name": "Pedro Lima", "phone": "(69) 99999-1004",
        "road_segment_id": "11111111-1111-1111-1111-000000000002",
        "latitude": -9.939, "longitude": -63.009,
        "description": "Erosão na lateral da estrada depois da última chuva forte.",
        "image_url": None, "category": "erosao", "severity": "alta",
        "confidence": 0.79, "status": "aberta", "created_at": _hours_ago(72),
    },
    {
        "id": "22222222-2222-2222-2222-000000000005",
        "reporter_name": "Antônio Rocha", "phone": "(69) 99999-1005",
        "road_segment_id": "11111111-1111-1111-1111-000000000005",
        "latitude": -9.969, "longitude": -63.159,
        "description": "Atolei a caminhonete no travessão, solo muito mole.",
        "image_url": None, "category": "atolamento", "severity": "alta",
        "confidence": 0.82, "status": "aberta", "created_at": _hours_ago(48),
    },
    {
        "id": "22222222-2222-2222-2222-000000000006",
        "reporter_name": "Sebastião Alves", "phone": "(69) 99999-1006",
        "road_segment_id": "11111111-1111-1111-1111-000000000003",
        "latitude": -9.898, "longitude": -62.989,
        "description": "Apareceu um buraco no meio da pista, dá pra desviar ainda.",
        "image_url": None, "category": "buraco", "severity": "media",
        "confidence": 0.71, "status": "resolvida", "created_at": _hours_ago(144),
    },
]


def to_geojson_line(coordinates: list[list[float]] | None) -> dict | None:
    """Converte uma lista [lon, lat] em um objeto GeoJSON LineString."""
    if not coordinates:
        return None
    return {"type": "LineString", "coordinates": coordinates}
