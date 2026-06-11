"""
Testes de integração da API REST (Etapa 4), em modo mock.

Cobrem o fluxo dos Critérios de Aceite (Seção 17): listar trechos, ver detalhe,
cadastrar denúncia, recalcular score e gerenciar denúncias.
"""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

SEG_CRITICO = "11111111-1111-1111-1111-000000000001"  # Ponte do Branco


def test_health_modo_mock():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["mode"] == "mock"


# --- Trechos ---------------------------------------------------------------

def test_lista_trechos_traz_oito_com_geometria():
    r = client.get("/segments")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 8
    primeiro = data[0]
    assert primeiro["geometry"]["type"] == "LineString"
    assert primeiro["risk_level"] in {"baixo", "medio", "alto", "critico"}
    assert 0 <= primeiro["risk_score"] <= 100


def test_detalhe_trecho_tem_recomendacoes_e_fatores():
    r = client.get(f"/segments/{SEG_CRITICO}")
    assert r.status_code == 200
    detail = r.json()
    assert detail["recommendations"]            # lista não vazia
    assert len(detail["factors"]) == 4          # 4 fatores do modelo
    assert "Risco" in detail["explanation"]


def test_detalhe_trecho_inexistente_404():
    r = client.get("/segments/11111111-1111-1111-1111-999999999999")
    assert r.status_code == 404


# --- Denúncia + recálculo (Critério de Aceite) -----------------------------

def test_criar_denuncia_recalcula_trecho():
    # score antes
    antes = client.get(f"/segments/{SEG_CRITICO}").json()["risk_score"]
    contagem_antes = client.get(f"/segments/{SEG_CRITICO}").json()["reports_count"]

    nova = {
        "reporter_name": "Teste Automático",
        "road_segment_id": SEG_CRITICO,
        "description": "Atolamento grave após chuva forte.",
        "category": "atolamento",
        "severity": "critica",
    }
    r = client.post("/reports", json=nova)
    assert r.status_code == 201
    report_id = r.json()["id"]
    assert r.json()["status"] == "aberta"

    # a contagem de relatos do trecho aumentou
    depois = client.get(f"/segments/{SEG_CRITICO}").json()
    assert depois["reports_count"] == contagem_antes + 1
    assert depois["risk_score"] >= antes  # mais um relato crítico não reduz o risco

    # aparece na listagem filtrada por trecho
    lst = client.get("/reports", params={"road_segment_id": SEG_CRITICO}).json()
    assert any(x["id"] == report_id for x in lst)

    # PATCH de status
    rp = client.patch(f"/reports/{report_id}/status", json={"status": "resolvida"})
    assert rp.status_code == 200
    assert rp.json()["status"] == "resolvida"

    # DELETE (limpeza)
    rd = client.delete(f"/reports/{report_id}")
    assert rd.status_code == 204


def test_filtro_reports_por_status():
    r = client.get("/reports", params={"status": "aberta"})
    assert r.status_code == 200
    assert all(x["status"] == "aberta" for x in r.json())


def test_recalculate_todos():
    r = client.post("/segments/recalculate")
    assert r.status_code == 200
    assert r.json()["updated"] == 8
