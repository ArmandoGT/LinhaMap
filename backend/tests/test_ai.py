"""
Testes da camada de IA (Etapa 5), em modo fallback (sem chave de API).

Cobrem: classificação por regras (Seção 6.5), endpoint /ai/classify-report,
auto-classificação no POST /reports e o relatório semanal /ai/...summary.
"""

from fastapi.testclient import TestClient

from app.main import app
from app.services.ai_classifier import classify_by_rules

client = TestClient(app)


# --- Fallback por regras (Seção 6.5) ---------------------------------------

def test_regras_categoria_lama():
    r = classify_by_rules("Muita lama na pista, escorregadio.")
    assert r["categoria"] == "lama"
    assert r["fonte"] == "regras"


def test_regras_categoria_buraco_e_severidade_alta():
    r = classify_by_rules("Buraco grande e fundo no meio da estrada.")
    assert r["categoria"] == "buraco"
    assert r["severidade"] == "alta"


def test_regras_ponte_critica():
    r = classify_by_rules("A ponte está cedendo, situação grave e urgente.")
    assert r["categoria"] == "ponte_danificada"
    assert r["severidade"] == "critica"


def test_regras_atolamento():
    r = classify_by_rules("Caminhão atolou no barro.")
    assert r["categoria"] == "atolamento"


def test_regras_sem_match_eh_outro():
    r = classify_by_rules("Mensagem qualquer sem palavra-chave.")
    assert r["categoria"] == "outro"
    assert r["confianca"] < 0.5


def test_contrato_json_completo():
    r = classify_by_rules("erosão na lateral")
    assert set(r.keys()) == {"categoria", "severidade", "confianca", "justificativa", "fonte"}
    assert r["categoria"] == "erosao"


# --- Endpoint /ai/classify-report ------------------------------------------

def test_endpoint_classify_report():
    r = client.post("/ai/classify-report", json={"description": "muita lama escorregadia na descida"})
    assert r.status_code == 200
    body = r.json()
    assert body["categoria"] == "lama"
    assert 0 <= body["confianca"] <= 1


# --- Auto-classificação no POST /reports -----------------------------------

def test_post_report_autoclassifica_quando_sem_categoria():
    nova = {
        "reporter_name": "Auto IA",
        "road_segment_id": "11111111-1111-1111-1111-000000000004",
        "description": "Buraco enorme e perigoso na pista.",
        # sem 'category' nem 'severity' -> deve classificar sozinho
    }
    r = client.post("/reports", json=nova)
    assert r.status_code == 201
    body = r.json()
    assert body["category"] == "buraco"
    assert body["confidence"] is not None
    client.delete(f"/reports/{body['id']}")  # limpeza


# --- Relatório semanal ------------------------------------------------------

def test_weekly_summary_tem_texto_e_dados():
    r = client.post("/ai/generate-weekly-summary")
    assert r.status_code == 200
    body = r.json()
    assert body["generated_by"] == "regras"  # sem chave de IA
    assert "Ariquemes" in body["summary"]
    assert body["data"]["total_segments"] == 8
    assert "reports_by_category" in body["data"]
