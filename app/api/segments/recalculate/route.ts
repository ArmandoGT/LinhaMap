import { NextResponse } from "next/server";

import { getRepository } from "@/lib/repository";
import { reprocessDaily } from "@/lib/services/worker";

export const dynamic = "force-dynamic";

/**
 * POST /api/segments/recalculate — atualiza a chuva real (Open-Meteo) e
 * recalcula o score de todos os trechos. Usado para sincronizar após o deploy.
 */
export async function POST() {
  const result = await reprocessDaily(getRepository());
  return NextResponse.json(result);
}
