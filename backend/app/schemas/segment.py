"""Schemas dos trechos (road_segments)."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from ..models.enums import RiskLevel


class DailyForecast(BaseModel):
    """Previsão de chuva de um dia (para o gráfico de 7 dias)."""
    date: str           # rótulo do dia, ex.: "D+1"
    mm: float           # precipitação prevista em mm


class SegmentBase(BaseModel):
    """Campos comuns de um trecho."""
    name: str
    rural_line: str
    latitude: float
    longitude: float
    slope: float = 0
    accumulated_rain_72h: float = 0
    forecast_rain_7d: float = 0
    forecast_daily: list[DailyForecast] | None = None


class SegmentCreate(SegmentBase):
    """Payload para criar um trecho (POST /segments)."""
    # Lista de [lon, lat] que compõe a LineString do trecho.
    coordinates: list[list[float]] | None = None


class SegmentUpdate(BaseModel):
    """Payload parcial para atualizar um trecho (PUT /segments/{id})."""
    name: str | None = None
    rural_line: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    slope: float | None = None
    accumulated_rain_72h: float | None = None
    forecast_rain_7d: float | None = None
    forecast_daily: list[DailyForecast] | None = None
    coordinates: list[list[float]] | None = None


class SegmentOut(SegmentBase):
    """Trecho retornado pela API, já com score e nível calculados."""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    reports_count: int = 0
    risk_score: float = Field(ge=0, le=100)
    risk_level: RiskLevel
    explanation: str | None = None
    # GeoJSON LineString para o mapa: {"type": "LineString", "coordinates": [[lon, lat], ...]}
    geometry: dict | None = None
    updated_at: datetime | None = None
