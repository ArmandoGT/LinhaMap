"""
Camada de repositório (persistência) do LinhaMap.

Expõe uma interface única para trechos e denúncias com duas implementações:
    - MockRepository .... estado em memória (modo demonstração, sem Supabase)
    - SupabaseRepository  persiste/consulta no Postgres via supabase-py

As rotas dependem só da interface, ficando agnósticas quanto à fonte de dados.
A função `get_repository()` escolhe a implementação conforme a configuração.
"""

from __future__ import annotations

import copy
from datetime import datetime, timezone
from functools import lru_cache
from uuid import uuid4

from .config import get_settings
from .database import get_supabase_client
from .mock_data import MOCK_REPORTS, MOCK_SEGMENTS
from .services.scoring import calculate_traffic_index


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ===========================================================================
# Interface
# ===========================================================================

class BaseRepository:
    """Contrato comum de acesso a dados (trechos e denúncias)."""

    # --- Trechos ---
    def list_segments(self) -> list[dict]: raise NotImplementedError
    def get_segment(self, segment_id: str) -> dict | None: raise NotImplementedError
    def create_segment(self, data: dict) -> dict: raise NotImplementedError
    def update_segment(self, segment_id: str, data: dict) -> dict | None: raise NotImplementedError
    def delete_segment(self, segment_id: str) -> bool: raise NotImplementedError
    def reports_for_segment(self, segment_id: str) -> list[dict]: raise NotImplementedError
    def recalculate_all(self) -> int: raise NotImplementedError

    # --- Denúncias ---
    def list_reports(self, *, status=None, category=None, road_segment_id=None) -> list[dict]:
        raise NotImplementedError
    def get_report(self, report_id: str) -> dict | None: raise NotImplementedError
    def create_report(self, data: dict) -> dict: raise NotImplementedError
    def update_report(self, report_id: str, data: dict) -> dict | None: raise NotImplementedError
    def delete_report(self, report_id: str) -> bool: raise NotImplementedError
    def set_report_status(self, report_id: str, status: str) -> dict | None: raise NotImplementedError


# Campos do score recalculados pelo motor (Etapa 3), compartilhados pelos modos.
def _score_fields(segment: dict, reports: list[dict]) -> dict:
    result = calculate_traffic_index(
        accumulated_rain_72h=segment.get("accumulated_rain_72h", 0) or 0,
        forecast_rain_7d=segment.get("forecast_rain_7d", 0) or 0,
        slope=segment.get("slope", 0) or 0,
        reports=reports,
    )
    return {
        "risk_score": result.score,
        "risk_level": result.level.value,
        "explanation": result.explanation,
        "reports_count": len(reports),
        "updated_at": _now_iso(),
    }


# ===========================================================================
# Implementação MOCK (em memória)
# ===========================================================================

class MockRepository(BaseRepository):
    """Repositório em memória, semeado a partir de mock_data (Regra 10)."""

    def __init__(self) -> None:
        # Cópias mutáveis para não alterar as constantes importadas.
        self._segments: list[dict] = copy.deepcopy(MOCK_SEGMENTS)
        self._reports: list[dict] = copy.deepcopy(MOCK_REPORTS)
        # Já recalcula com o motor para a lista refletir scores coerentes.
        self.recalculate_all()

    # --- helpers ---
    def _find_segment(self, segment_id: str) -> dict | None:
        return next((s for s in self._segments if str(s["id"]) == str(segment_id)), None)

    def _find_report(self, report_id: str) -> dict | None:
        return next((r for r in self._reports if str(r["id"]) == str(report_id)), None)

    def _recalc_segment(self, segment_id: str) -> None:
        seg = self._find_segment(segment_id)
        if seg is not None:
            seg.update(_score_fields(seg, self.reports_for_segment(segment_id)))

    # --- Trechos ---
    def list_segments(self) -> list[dict]:
        return [copy.deepcopy(s) for s in self._segments]

    def get_segment(self, segment_id: str) -> dict | None:
        seg = self._find_segment(segment_id)
        return copy.deepcopy(seg) if seg else None

    def create_segment(self, data: dict) -> dict:
        seg = {
            "id": str(uuid4()),
            "reports_count": 0, "risk_score": 0, "risk_level": "baixo",
            "explanation": None, "updated_at": _now_iso(),
            **data,
        }
        seg.update(_score_fields(seg, []))
        self._segments.append(seg)
        return copy.deepcopy(seg)

    def update_segment(self, segment_id: str, data: dict) -> dict | None:
        seg = self._find_segment(segment_id)
        if seg is None:
            return None
        seg.update({k: v for k, v in data.items() if v is not None})
        seg.update(_score_fields(seg, self.reports_for_segment(segment_id)))
        return copy.deepcopy(seg)

    def delete_segment(self, segment_id: str) -> bool:
        seg = self._find_segment(segment_id)
        if seg is None:
            return False
        self._segments.remove(seg)
        # Desvincula denúncias órfãs.
        for r in self._reports:
            if str(r.get("road_segment_id")) == str(segment_id):
                r["road_segment_id"] = None
        return True

    def reports_for_segment(self, segment_id: str) -> list[dict]:
        return [r for r in self._reports if str(r.get("road_segment_id")) == str(segment_id)]

    def recalculate_all(self) -> int:
        for seg in self._segments:
            seg.update(_score_fields(seg, self.reports_for_segment(seg["id"])))
        return len(self._segments)

    # --- Denúncias ---
    def list_reports(self, *, status=None, category=None, road_segment_id=None) -> list[dict]:
        rows = self._reports
        if status:
            rows = [r for r in rows if r.get("status") == status]
        if category:
            rows = [r for r in rows if r.get("category") == category]
        if road_segment_id:
            rows = [r for r in rows if str(r.get("road_segment_id")) == str(road_segment_id)]
        # Mais recentes primeiro.
        rows = sorted(rows, key=lambda r: r.get("created_at") or "", reverse=True)
        return [copy.deepcopy(r) for r in rows]

    def get_report(self, report_id: str) -> dict | None:
        r = self._find_report(report_id)
        return copy.deepcopy(r) if r else None

    def create_report(self, data: dict) -> dict:
        report = {
            "id": str(uuid4()),
            "category": "outro", "severity": "media", "confidence": None,
            "status": "aberta", "created_at": _now_iso(), "updated_at": _now_iso(),
            **data,
        }
        self._reports.append(report)
        # Nova denúncia recalcula o trecho afetado (Critério de Aceite).
        if report.get("road_segment_id"):
            self._recalc_segment(report["road_segment_id"])
        return copy.deepcopy(report)

    def update_report(self, report_id: str, data: dict) -> dict | None:
        r = self._find_report(report_id)
        if r is None:
            return None
        r.update({k: v for k, v in data.items() if v is not None})
        r["updated_at"] = _now_iso()
        if r.get("road_segment_id"):
            self._recalc_segment(r["road_segment_id"])
        return copy.deepcopy(r)

    def delete_report(self, report_id: str) -> bool:
        r = self._find_report(report_id)
        if r is None:
            return False
        seg_id = r.get("road_segment_id")
        self._reports.remove(r)
        if seg_id:
            self._recalc_segment(seg_id)
        return True

    def set_report_status(self, report_id: str, status: str) -> dict | None:
        return self.update_report(report_id, {"status": status})


# ===========================================================================
# Implementação SUPABASE (Postgres via supabase-py)
# ===========================================================================

class SupabaseRepository(BaseRepository):
    """Persiste no Supabase. A geometria PostGIS é alimentada via SQL/seed;
    a API usa a coluna `coordinates` (jsonb) para o traçado."""

    SEGMENTS = "road_segments"
    REPORTS = "reports"

    def __init__(self) -> None:
        self.client = get_supabase_client()
        if self.client is None:  # pragma: no cover
            raise RuntimeError("SupabaseRepository requer credenciais Supabase configuradas.")

    # --- Trechos ---
    def list_segments(self) -> list[dict]:
        return self.client.table(self.SEGMENTS).select("*").execute().data or []

    def get_segment(self, segment_id: str) -> dict | None:
        rows = self.client.table(self.SEGMENTS).select("*").eq("id", segment_id).limit(1).execute().data
        return rows[0] if rows else None

    def create_segment(self, data: dict) -> dict:
        payload = {**data}
        payload.update(_score_fields(payload, []))
        return self.client.table(self.SEGMENTS).insert(payload).execute().data[0]

    def update_segment(self, segment_id: str, data: dict) -> dict | None:
        existing = self.get_segment(segment_id)
        if existing is None:
            return None
        merged = {**existing, **{k: v for k, v in data.items() if v is not None}}
        merged.update(_score_fields(merged, self.reports_for_segment(segment_id)))
        clean = {k: v for k, v in merged.items() if k not in ("geometry",)}
        rows = self.client.table(self.SEGMENTS).update(clean).eq("id", segment_id).execute().data
        return rows[0] if rows else None

    def delete_segment(self, segment_id: str) -> bool:
        rows = self.client.table(self.SEGMENTS).delete().eq("id", segment_id).execute().data
        return bool(rows)

    def reports_for_segment(self, segment_id: str) -> list[dict]:
        return self.client.table(self.REPORTS).select("*").eq("road_segment_id", segment_id).execute().data or []

    def recalculate_all(self) -> int:
        segments = self.list_segments()
        for seg in segments:
            fields = _score_fields(seg, self.reports_for_segment(seg["id"]))
            self.client.table(self.SEGMENTS).update(fields).eq("id", seg["id"]).execute()
        return len(segments)

    # --- Denúncias ---
    def list_reports(self, *, status=None, category=None, road_segment_id=None) -> list[dict]:
        query = self.client.table(self.REPORTS).select("*")
        if status:
            query = query.eq("status", status)
        if category:
            query = query.eq("category", category)
        if road_segment_id:
            query = query.eq("road_segment_id", str(road_segment_id))
        return query.order("created_at", desc=True).execute().data or []

    def get_report(self, report_id: str) -> dict | None:
        rows = self.client.table(self.REPORTS).select("*").eq("id", report_id).limit(1).execute().data
        return rows[0] if rows else None

    def create_report(self, data: dict) -> dict:
        row = self.client.table(self.REPORTS).insert(data).execute().data[0]
        if row.get("road_segment_id"):
            self._recalc_segment(row["road_segment_id"])
        return row

    def update_report(self, report_id: str, data: dict) -> dict | None:
        clean = {k: v for k, v in data.items() if v is not None}
        rows = self.client.table(self.REPORTS).update(clean).eq("id", report_id).execute().data
        if not rows:
            return None
        if rows[0].get("road_segment_id"):
            self._recalc_segment(rows[0]["road_segment_id"])
        return rows[0]

    def delete_report(self, report_id: str) -> bool:
        existing = self.get_report(report_id)
        rows = self.client.table(self.REPORTS).delete().eq("id", report_id).execute().data
        if existing and existing.get("road_segment_id"):
            self._recalc_segment(existing["road_segment_id"])
        return bool(rows)

    def set_report_status(self, report_id: str, status: str) -> dict | None:
        return self.update_report(report_id, {"status": status})

    def _recalc_segment(self, segment_id: str) -> None:
        seg = self.get_segment(segment_id)
        if seg is not None:
            fields = _score_fields(seg, self.reports_for_segment(segment_id))
            self.client.table(self.SEGMENTS).update(fields).eq("id", segment_id).execute()


# ===========================================================================
# Factory
# ===========================================================================

@lru_cache
def get_repository() -> BaseRepository:
    """Retorna o repositório ativo conforme a configuração (mock x supabase)."""
    if get_settings().use_supabase:
        return SupabaseRepository()
    return MockRepository()
