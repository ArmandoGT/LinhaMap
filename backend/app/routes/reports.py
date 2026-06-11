"""
Rotas de Denúncias (reports) — Seção 9.

GET    /reports                lista denúncias (filtros opcionais)
GET    /reports/{id}           detalhe da denúncia
POST   /reports                cria denúncia (recalcula o trecho afetado)
PUT    /reports/{id}           atualiza denúncia
DELETE /reports/{id}           remove denúncia
PATCH  /reports/{id}/status    altera apenas o status
"""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status

from ..models.enums import ReportCategory, ReportStatus
from ..repository import get_repository
from ..schemas.report import (
    ReportCreate,
    ReportOut,
    ReportStatusUpdate,
    ReportUpdate,
)

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[ReportOut])
def list_reports(
    status: ReportStatus | None = Query(default=None, description="Filtra por status"),
    category: ReportCategory | None = Query(default=None, description="Filtra por categoria"),
    road_segment_id: UUID | None = Query(default=None, description="Filtra por trecho"),
):
    """Lista denúncias, com filtros opcionais (status, categoria, trecho)."""
    repo = get_repository()
    return repo.list_reports(
        status=status.value if status else None,
        category=category.value if category else None,
        road_segment_id=road_segment_id,
    )


@router.get("/{report_id}", response_model=ReportOut)
def get_report(report_id: UUID):
    """Detalhe de uma denúncia."""
    repo = get_repository()
    report = repo.get_report(str(report_id))
    if report is None:
        raise HTTPException(status_code=404, detail="Denúncia não encontrada.")
    return report


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def create_report(payload: ReportCreate):
    """
    Registra uma nova denúncia e recalcula o trecho afetado.

    Obs.: a classificação automática por IA (categoria/severidade a partir da
    descrição/imagem) será integrada aqui na Etapa 5. Por ora, usa os valores
    enviados ou os padrões ('outro'/'media').
    """
    repo = get_repository()
    data = payload.model_dump(exclude_none=True)
    if data.get("road_segment_id") is not None:
        data["road_segment_id"] = str(data["road_segment_id"])
    return repo.create_report(data)


@router.put("/{report_id}", response_model=ReportOut)
def update_report(report_id: UUID, payload: ReportUpdate):
    """Atualiza uma denúncia (recalcula o trecho, se vinculado)."""
    repo = get_repository()
    data = payload.model_dump(exclude_none=True)
    if data.get("road_segment_id") is not None:
        data["road_segment_id"] = str(data["road_segment_id"])
    report = repo.update_report(str(report_id), data)
    if report is None:
        raise HTTPException(status_code=404, detail="Denúncia não encontrada.")
    return report


@router.patch("/{report_id}/status", response_model=ReportOut)
def update_report_status(report_id: UUID, payload: ReportStatusUpdate):
    """Altera apenas o status da denúncia (aberta/em_analise/resolvida)."""
    repo = get_repository()
    report = repo.set_report_status(str(report_id), payload.status.value)
    if report is None:
        raise HTTPException(status_code=404, detail="Denúncia não encontrada.")
    return report


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(report_id: UUID):
    """Remove uma denúncia (recalcula o trecho afetado)."""
    repo = get_repository()
    if not repo.delete_report(str(report_id)):
        raise HTTPException(status_code=404, detail="Denúncia não encontrada.")
    return None
