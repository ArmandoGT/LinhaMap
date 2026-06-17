/** Rótulos em português dos enums de domínio (UI). */
import type {
  AlertChannel,
  ReportCategory,
  ReportSeverity,
  ReportStatus,
  RiskLevel,
  WorkOrderStatus,
} from "@/lib/types";

export const RISK_LABELS: Record<RiskLevel, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
  critico: "Crítico",
};

export const CHANNEL_LABELS: Record<AlertChannel, string> = {
  in_app: "No app",
  email: "E-mail",
  whatsapp: "WhatsApp",
};

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  agendada: "Agendada",
  em_execucao: "Em execução",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  buraco: "Buraco",
  lama: "Lama",
  erosao: "Erosão",
  ponte_danificada: "Ponte danificada",
  atolamento: "Atolamento",
  outro: "Outro",
};

export const SEVERITY_LABELS: Record<ReportSeverity, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  critica: "Crítica",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  aberta: "Aberta",
  em_analise: "Em análise",
  resolvida: "Resolvida",
};

/** Origem da denúncia: com conta (user_id) vs anônima (user_id null). */
export const ORIGIN_LABELS = {
  with_account: "Com conta",
  anonymous: "Anônima",
} as const;
