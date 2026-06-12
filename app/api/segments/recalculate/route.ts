import { NextResponse } from "next/server";

import { getRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

/** POST /api/segments/recalculate — recalcula o score de todos os trechos. */
export async function POST() {
  const repo = getRepository();
  const updated = await repo.recalculateAll();
  return NextResponse.json({
    updated,
    message: `${updated} trechos recalculados com sucesso.`,
  });
}
