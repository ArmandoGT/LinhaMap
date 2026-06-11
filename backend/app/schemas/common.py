"""Schemas utilitários compartilhados (health, raiz, mensagens)."""

from pydantic import BaseModel


class RootResponse(BaseModel):
    """Resposta da rota raiz `/`."""
    service: str
    version: str
    docs: str
    message: str


class HealthResponse(BaseModel):
    """Resposta do healthcheck `/health`."""
    status: str          # "ok"
    service: str
    version: str
    mode: str            # "mock" | "supabase"
    database: str        # "mock" | "connected" | "unavailable"
    ai_classification: bool


class MessageResponse(BaseModel):
    """Resposta genérica de mensagem (ações simples)."""
    message: str
