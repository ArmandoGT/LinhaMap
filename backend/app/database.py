"""
Camada de acesso ao banco (Supabase).

Centraliza a criação do client Supabase e expõe o modo de operação atual
(mock x supabase). Os serviços (Etapa 4+) usam estas funções para decidir a
fonte de dados, mantendo as rotas agnósticas quanto à persistência.
"""

from functools import lru_cache

from .config import get_settings

try:  # supabase é opcional em modo mock
    from supabase import create_client, Client
except ImportError:  # pragma: no cover
    create_client = None
    Client = None  # type: ignore


@lru_cache
def get_supabase_client():
    """
    Retorna o client Supabase quando configurado, ou None em modo mock.

    Cacheado para reaproveitar a conexão entre requisições.
    """
    settings = get_settings()
    if not settings.use_supabase:
        return None
    if create_client is None:
        raise RuntimeError(
            "Pacote 'supabase' não instalado. Rode `pip install -r requirements.txt`."
        )
    return create_client(settings.supabase_url, settings.supabase_key)


def get_mode() -> str:
    """Modo de dados ativo: 'supabase' ou 'mock'."""
    return "supabase" if get_settings().use_supabase else "mock"


def check_database() -> str:
    """
    Verifica a saúde da fonte de dados (usado no /health).

    Retorna: 'mock' | 'connected' | 'unavailable'.
    """
    settings = get_settings()
    if not settings.use_supabase:
        return "mock"
    try:
        client = get_supabase_client()
        # Consulta leve só para validar conectividade.
        client.table("road_segments").select("id").limit(1).execute()
        return "connected"
    except Exception:  # noqa: BLE001 - healthcheck não deve derrubar a API
        return "unavailable"
