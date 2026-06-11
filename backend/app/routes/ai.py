"""
Rotas de IA — Seção 9.

POST /ai/classify-report          classifica uma denúncia (categoria/severidade)
POST /ai/generate-weekly-summary  gera o resumo semanal para a Secretaria
"""

from fastapi import APIRouter

from ..repository import get_repository
from ..schemas.ai import ClassificationResult, ClassifyRequest, WeeklySummaryResponse
from ..services.ai_classifier import classify_report
from ..services.reporting import generate_weekly_summary

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/classify-report", response_model=ClassificationResult)
def classify(payload: ClassifyRequest):
    """
    Classifica a ocorrência por imagem/descrição.

    Usa IA multimodal (Claude) quando configurada; senão, fallback por regras.
    """
    return classify_report(description=payload.description, image_url=payload.image_url)


@router.post("/generate-weekly-summary", response_model=WeeklySummaryResponse)
def weekly_summary():
    """Gera o resumo semanal das ocorrências (LLM ou lógica simples)."""
    repo = get_repository()
    return generate_weekly_summary(repo.list_segments(), repo.list_reports())
