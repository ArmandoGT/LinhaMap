"""
Rotas de Trechos (road_segments) — Seção 9.

GET    /segments               lista trechos
GET    /segments/{id}          detalhe (com recomendações e fatores)
POST   /segments               cria trecho
PUT    /segments/{id}          atualiza trecho
DELETE /segments/{id}          remove trecho
POST   /segments/recalculate   recalcula o score de todos os trechos
"""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from ..repository import get_repository
from ..schemas.segment import (
    RecalculateResult,
    SegmentCreate,
    SegmentDetail,
    SegmentOut,
    SegmentUpdate,
)
from ..services.serializers import serialize_segment, serialize_segment_detail

router = APIRouter(prefix="/segments", tags=["segments"])


@router.get("", response_model=list[SegmentOut])
def list_segments():
    """Lista todos os trechos monitorados (para o mapa)."""
    repo = get_repository()
    return [serialize_segment(s) for s in repo.list_segments()]


@router.post("/recalculate", response_model=RecalculateResult)
def recalculate_segments():
    """Recalcula o Índice de Trafegabilidade de todos os trechos (motor da Etapa 3)."""
    repo = get_repository()
    count = repo.recalculate_all()
    return RecalculateResult(updated=count, message=f"{count} trechos recalculados com sucesso.")


@router.get("/{segment_id}", response_model=SegmentDetail)
def get_segment(segment_id: UUID):
    """Detalhe do trecho com explicação, recomendações e fatores do score."""
    repo = get_repository()
    seg = repo.get_segment(str(segment_id))
    if seg is None:
        raise HTTPException(status_code=404, detail="Trecho não encontrado.")
    reports = repo.reports_for_segment(str(segment_id))
    return serialize_segment_detail(seg, reports)


@router.post("", response_model=SegmentDetail, status_code=status.HTTP_201_CREATED)
def create_segment(payload: SegmentCreate):
    """Cria um novo trecho e calcula seu score inicial."""
    repo = get_repository()
    data = payload.model_dump(exclude_none=True)
    seg = repo.create_segment(data)
    return serialize_segment_detail(seg, repo.reports_for_segment(seg["id"]))


@router.put("/{segment_id}", response_model=SegmentDetail)
def update_segment(segment_id: UUID, payload: SegmentUpdate):
    """Atualiza um trecho (revalida o score automaticamente)."""
    repo = get_repository()
    data = payload.model_dump(exclude_none=True)
    seg = repo.update_segment(str(segment_id), data)
    if seg is None:
        raise HTTPException(status_code=404, detail="Trecho não encontrado.")
    return serialize_segment_detail(seg, repo.reports_for_segment(str(segment_id)))


@router.delete("/{segment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_segment(segment_id: UUID):
    """Remove um trecho."""
    repo = get_repository()
    if not repo.delete_segment(str(segment_id)):
        raise HTTPException(status_code=404, detail="Trecho não encontrado.")
    return None
