"""
Enums de domínio — espelham exatamente os tipos ENUM do banco (schema.sql).

Herdam de `str` para serializarem como texto no JSON da API.
"""

from enum import Enum


class RiskLevel(str, Enum):
    """Nível de risco derivado do Índice de Trafegabilidade (0-100)."""
    BAIXO = "baixo"      # 0  - 24
    MEDIO = "medio"      # 25 - 49
    ALTO = "alto"        # 50 - 74
    CRITICO = "critico"  # 75 - 100


class ReportCategory(str, Enum):
    """Categorias de ocorrência de uma denúncia (Seção 5/6.5)."""
    BURACO = "buraco"
    LAMA = "lama"
    EROSAO = "erosao"
    PONTE_DANIFICADA = "ponte_danificada"
    ATOLAMENTO = "atolamento"
    OUTRO = "outro"


class ReportSeverity(str, Enum):
    """Severidade da ocorrência."""
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    CRITICA = "critica"


class ReportStatus(str, Enum):
    """Ciclo de vida da denúncia."""
    ABERTA = "aberta"
    EM_ANALISE = "em_analise"
    RESOLVIDA = "resolvida"
