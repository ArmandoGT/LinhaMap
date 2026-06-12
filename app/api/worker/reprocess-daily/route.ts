import { type NextRequest, NextResponse } from "next/server";

import { config } from "@/lib/config";
import { getRepository } from "@/lib/repository";
import { reprocessDaily } from "@/lib/services/worker";

export const dynamic = "force-dynamic";

/**
 * POST /api/worker/reprocess-daily — recalcula scores e registra log (cron diário).
 * Se CRON_SECRET estiver definido, exige Authorization: Bearer <CRON_SECRET>.
 */
export async function POST(req: NextRequest) {
  if (config.cronSecret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${config.cronSecret}`) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
  }
  const result = await reprocessDaily(getRepository());
  return NextResponse.json(result);
}
