import { NextResponse } from "next/server";

import { getRepository } from "@/lib/repository";
import { reportsToCsv } from "@/lib/services/dashboard";

export const dynamic = "force-dynamic";

/** GET /api/dashboard/export-csv — exporta as denúncias em CSV. */
export async function GET() {
  const repo = getRepository();
  const [segments, reports] = await Promise.all([repo.listSegments(), repo.listReports()]);
  const csv = reportsToCsv(reports, segments);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="linhamap_denuncias.csv"',
    },
  });
}
