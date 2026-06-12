/**
 * Configuração central (lida de variáveis de ambiente — server-side).
 * Valores padrão seguros: por padrão opera em modo mock, sem IA.
 */
export const config = {
  // Modo de dados: mock por padrão (só usa Supabase se explicitamente desligado).
  enableMockData: process.env.ENABLE_MOCK_DATA !== "false",

  // Supabase (server-side / service role).
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  // Dados públicos.
  openMeteoBaseUrl:
    process.env.OPEN_METEO_BASE_URL ?? "https://api.open-meteo.com/v1/forecast",

  // IA (opcional — há fallback por regras).
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  enableAiClassification: process.env.ENABLE_AI_CLASSIFICATION === "true",
  aiModelClassify: "claude-haiku-4-5-20251001", // multimodal, rápido/barato
  aiModelReport: "claude-sonnet-4-6", // resumo semanal (texto)

  // Proteção simples do endpoint de cron.
  cronSecret: process.env.CRON_SECRET ?? "",
};

/** Usa Supabase apenas quando o modo mock está desligado E há credenciais. */
export function isSupabaseMode(): boolean {
  return !config.enableMockData && Boolean(config.supabaseUrl && config.supabaseServiceKey);
}

/** IA multimodal só liga com a flag e a chave presentes (senão, fallback). */
export function aiEnabled(): boolean {
  return config.enableAiClassification && Boolean(config.anthropicApiKey);
}

/** Modo de dados ativo (exibido no /api/health). */
export function dataMode(): "mock" | "supabase" {
  return isSupabaseMode() ? "supabase" : "mock";
}
