import { type NextRequest, NextResponse } from "next/server";

import { getRepository } from "@/lib/repository";

export const dynamic = "force-dynamic";

/** GET /api/follows?segment_id= — lista inscrições (alertas). */
export async function GET(req: NextRequest) {
  const repo = getRepository();
  const segmentId = req.nextUrl.searchParams.get("segment_id") ?? undefined;
  return NextResponse.json(await repo.listFollows(segmentId));
}

/** POST /api/follows — passa a seguir um trecho e recebe a confirmação. */
export async function POST(req: NextRequest) {
  const repo = getRepository();
  const data = await req.json().catch(() => ({}));
  if (!data.segment_id) {
    return NextResponse.json({ error: "segment_id é obrigatório." }, { status: 400 });
  }
  const follow = await repo.addFollow({
    segment_id: data.segment_id,
    name: data.name ?? null,
    contact: data.contact ?? null,
    channel: data.channel ?? "in_app",
  });
  return NextResponse.json(follow, { status: 201 });
}
