"""
Configuração central do LinhaMap.

Lê as variáveis de ambiente (Seção 15) via pydantic-settings. Todos os campos
têm valores padrão seguros para que a API suba mesmo sem um arquivo .env,
operando em modo mock por padrão.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Carrega de backend/.env; ignora variáveis extras; nomes case-insensitive.
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Identidade da aplicação ---
    app_name: str = "LinhaMap API"
    app_version: str = "0.1.0"

    # --- Supabase / Banco de dados ---
    supabase_url: str | None = None
    supabase_key: str | None = None
    database_url: str | None = None

    # --- Dados públicos ---
    open_meteo_base_url: str = "https://api.open-meteo.com/v1/forecast"

    # --- IA (opcional) ---
    anthropic_api_key: str | None = None
    enable_ai_classification: bool = False
    ai_model_classify: str = "claude-haiku-4-5-20251001"  # multimodal, rápido/barato
    ai_model_report: str = "claude-sonnet-4-6"            # resumo semanal (texto)

    # --- Flags do MVP ---
    enable_mock_data: bool = True

    # --- CORS ---
    cors_origins: str = "*"

    @property
    def cors_origins_list(self) -> list[str]:
        """Converte a string de origens em lista para o middleware de CORS."""
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def use_supabase(self) -> bool:
        """
        Define a fonte de dados ativa.

        Só usamos o Supabase quando o modo mock está desligado E há credenciais.
        Caso contrário, a API opera com dados mockados em memória.
        """
        return (not self.enable_mock_data) and bool(self.supabase_url and self.supabase_key)

    @property
    def ai_enabled(self) -> bool:
        """IA multimodal só liga com a flag e a chave presentes (senão, fallback)."""
        return self.enable_ai_classification and bool(self.anthropic_api_key)


@lru_cache
def get_settings() -> Settings:
    """Retorna a instância única de configuração (cacheada)."""
    return Settings()
