"""
LinhaMap — ponto de entrada da API FastAPI.

Sobe a aplicação, configura CORS e expõe as rotas de saúde. Os routers de
domínio (segments, reports, dashboard, ai, worker) são incluídos aqui à medida
que são implementados nas próximas etapas.

Rodar localmente:
    uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import check_database, get_mode
from .schemas.common import HealthResponse, RootResponse

settings = get_settings()

DESCRIPTION = """
**LinhaMap** — Plataforma Preditiva de Trafegabilidade Rural para Ariquemes/RO.

API REST que monitora o risco de bloqueio em estradas vicinais, cruzando chuva,
declividade e relatos da comunidade em um **Índice de Trafegabilidade (0-100)**.

Opera em dois modos: `mock` (dados em memória, sem dependências) e `supabase`.
"""


def create_app() -> FastAPI:
    """Cria e configura a instância FastAPI."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description=DESCRIPTION,
    )

    # CORS — libera o frontend Next.js a consumir a API.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Rotas de saúde -----------------------------------------------------
    @app.get("/", response_model=RootResponse, tags=["health"])
    def root() -> RootResponse:
        """Informações básicas do serviço."""
        return RootResponse(
            service=settings.app_name,
            version=settings.app_version,
            docs="/docs",
            message="API do LinhaMap no ar. Acesse /docs para a documentação interativa.",
        )

    @app.get("/health", response_model=HealthResponse, tags=["health"])
    def health() -> HealthResponse:
        """Healthcheck: estado do serviço, modo de dados e conectividade."""
        return HealthResponse(
            status="ok",
            service=settings.app_name,
            version=settings.app_version,
            mode=get_mode(),
            database=check_database(),
            ai_classification=settings.ai_enabled,
        )

    # --- Routers de domínio (adicionados nas próximas etapas) ---------------
    # from .routes import segments, reports, dashboard, ai, worker
    # app.include_router(segments.router)
    # app.include_router(reports.router)
    # app.include_router(dashboard.router)
    # app.include_router(ai.router)
    # app.include_router(worker.router)

    return app


app = create_app()
