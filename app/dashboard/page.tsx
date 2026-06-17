import { DashboardView } from "@/components/dashboard/dashboard-view";
import { getRepository } from "@/lib/repository";

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
      {/* Agregados (cards/gráfico/críticos) são calculados no cliente e reagem aos filtros. */}
      <DashboardView reports={reports} segments={segments} />
    </div>
  );
}
