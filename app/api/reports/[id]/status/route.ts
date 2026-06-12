import { type NextRequest, NextResponse } from "next/server";

import { getRepository } from "@/lib/repository";
import { REPORT_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = { params: { id: string } };

/** PATCH /api/reports/[id]/status — altera apenas o status da denúncia. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const repo = getRepository();
  const body = await req.json().catch(() => ({}));
  if (!REPORT_STATUSES.includes(body.status)) {
    return NextResponse.json(
      { error: `status inválido. Use: ${REPORT_STATUSES.join(", ")}.` },
      { status: 400 },
    );
  }
  const report = await repo.setReportStatus(params.id, body.status);
  if (!report) return NextResponse.json({ error: "Denúncia não encontrada." }, { status: 404 });
  return NextResponse.json(report);
}
