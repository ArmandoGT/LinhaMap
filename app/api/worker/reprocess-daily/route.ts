import { type NextRequest, NextResponse } from "next/server";

import { config } from "@/lib/config";
import { getRepository } from "@/lib/repository";
import { reprocessDaily } from "@/lib/services/worker";

export const dynamic = "force-dynamic";

/** Autoriza quando não há segredo configurado ou o Bearer confere. */
function authorized(req: NextRequest): boolean {
  if (!config.cronSecret) return true;
  return req.headers.get("authorization") === `Bearer ${config.cronSecret}`;
}

/**
 * Reprocessa o risco de todos os trechos e registra log (cron diário, Seção 6.8).
 * Aceita POST (GitHub Actions) e GET (Vercel Cron, que dispara via GET).
 * Se CRON_SECRET estiver definido, exige Authorization: Bearer <CRON_SECRET>.
 */
async function handle(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const result = await reprocessDaily(getRepository());
  return NextResponse.json(result);
}

export const POST = handle;
export const GET = handle;
