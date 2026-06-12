/**
 * Worker de reprocessamento diário (Seção 6.8) — porte de worker.py.
 * Recalcula o score de todos os trechos e registra o log da execução.
 */
import type { Repository } from "@/lib/repository";

export async function reprocessDaily(repo: Repository): Promise<{
  status: string;
  updated: number;
  message: string;
  executed_at: string | null;
}> {
  try {
    // Ponto de integração: atualizar previsão via Open-Meteo (lib/services/weather).
    const updated = await repo.recalculateAll();
    const message = `Reprocessamento diário concluído: ${updated} trechos recalculados.`;
    const log = await repo.addProcessingLog("success", message);
    return { status: "success", updated, message, executed_at: log.execution_date };
  } catch (err) {
    const message = `Falha no reprocessamento diário: ${String(err)}`;
    await repo.addProcessingLog("error", message).catch(() => undefined);
    return { status: "error", updated: 0, message, executed_at: null };
  }
}
