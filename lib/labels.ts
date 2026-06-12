/** Rótulos em português dos enums de domínio (UI). */
import type { ReportCategory, ReportSeverity, ReportStatus } from "@/lib/types";

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
