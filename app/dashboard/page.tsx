import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getRepository } from "@/lib/repository";
import { buildSummary, criticalSegments, reportsByCategory } from "@/lib/services/dashboard";
import { serializeSegment } from "@/lib/services/serializers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard da Secretaria — LinhaMap",
};

/** Área administrativa da Secretaria de Obras (Seção 6.6). */
export default async function DashboardPage() {
  const repo = getRepository();
  const [segments, reports] = await Promise.all([repo.listSegments(), repo.listReports()]);

  return (
    <div className="container py-10">
      <DashboardView
        summary={buildSummary(segments, reports)}
        criticalSegments={criticalSegments(segments).map(serializeSegment)}
        reports={reports}
        segments={segments}
        categoryCounts={reportsByCategory(reports)}
      />
    </div>
  );
}
