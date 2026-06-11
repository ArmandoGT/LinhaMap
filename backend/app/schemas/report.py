"""Schemas das denúncias (reports)."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from ..models.enums import ReportCategory, ReportSeverity, ReportStatus


class ReportBase(BaseModel):
    """Campos comuns de uma denúncia."""
    reporter_name: str | None = None
    phone: str | None = None
    road_segment_id: UUID | None = None
    latitude: float | None = None
    longitude: float | None = None
    description: str | None = None
    image_url: str | None = None


class ReportCreate(ReportBase):
    """
    Payload para registrar uma denúncia (POST /reports).

    Categoria e severidade são opcionais: se ausentes, a classificação
    automática (Etapa 5) preenche a partir da descrição/imagem.
    """
    category: ReportCategory | None = None
    severity: ReportSeverity | None = None


class ReportUpdate(BaseModel):
    """Payload parcial para atualizar uma denúncia (PUT /reports/{id})."""
    reporter_name: str | None = None
    phone: str | None = None
    road_segment_id: UUID | None = None
    latitude: float | None = None
    longitude: float | None = None
    description: str | None = None
    image_url: str | None = None
    category: ReportCategory | None = None
    severity: ReportSeverity | None = None
    status: ReportStatus | None = None


class ReportStatusUpdate(BaseModel):
    """Payload para PATCH /reports/{id}/status."""
    status: ReportStatus


class ReportOut(ReportBase):
    """Denúncia retornada pela API."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    category: ReportCategory
    severity: ReportSeverity
    confidence: float | None = Field(default=None, ge=0, le=1)
    status: ReportStatus
    created_at: datetime | None = None
    updated_at: datetime | None = None
