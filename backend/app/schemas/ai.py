"""Schemas da camada de IA (classificação e relatório semanal)."""

from pydantic import BaseModel, Field

from ..models.enums import ReportCategory, ReportSeverity


class ClassifyRequest(BaseModel):
    """Entrada de POST /ai/classify-report."""
    description: str | None = None
    image_url: str | None = None


class ClassificationResult(BaseModel):
    """
    Saída da classificação (formato JSON da Seção 6.5).

    `fonte` indica a origem: 'ia' (Claude) ou 'regras' (fallback).
    """
    categoria: ReportCategory
    severidade: ReportSeverity
    confianca: float = Field(ge=0, le=1)
    justificativa: str
    fonte: str


class WeeklySummaryResponse(BaseModel):
    """Saída de POST /ai/generate-weekly-summary."""
    summary: str
    generated_by: str        # 'ia' | 'regras'
    data: dict
