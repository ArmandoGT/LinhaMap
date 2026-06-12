import { NextResponse } from "next/server";

import { getRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

/** GET /api/notifications — central de alertas (mais recentes primeiro). */
export async function GET() {
  const repo = getRepository();
  return NextResponse.json(await repo.listNotifications());
}
