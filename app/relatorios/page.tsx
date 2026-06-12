import { ReportToolbar } from "@/components/report/report-toolbar";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/labels";
import { getRepository } from "@/lib/repository";
import { generateWeeklySummary } from "@/lib/services/reporting";
import type { ReportCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Relatório Semanal — LinhaMap",
};

/** Relatório semanal para a Secretaria (Seção 6.7). */
export default async function RelatoriosPage() {
  const repo = getRepository();
  const [segments, reports] = await Promise.all([repo.listSegments(), repo.listReports()]);
  const { summary, generated_by, data } = await generateWeeklySummary(segments, reports);

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatório semanal</h1>
          <p className="text-muted-foreground">
            Resumo das ocorrências e prioridades — pronto para ata, ofício ou apresentação.
          </p>
          <span className="mt-2 inline-block rounded-full bg-secondary px-3 py-0.5 text-xs font-medium text-secondary-foreground">
            Gerado por: {generated_by === "ia" ? "Inteligência Artificial" : "lógica do sistema"}
          </span>
        </div>
        <ReportToolbar text={summary} />
      </div>

      {/* Resumo textual */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <p className="whitespace-pre-line leading-relaxed text-foreground">{summary}</p>
        </CardContent>
      </Card>

      {/* Indicadores estruturados */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="font-semibold">Trechos críticos prioritários</h2>
            {data.critical_segments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum trecho crítico.</p>
            ) : (
              <ul className="flex flex-col divide-y">
                {data.critical_segments.map((s) => (
                  <li key={`${s.rural_line}-${s.name}`} className="flex justify-between gap-2 py-2 text-sm">
                    <span>
                      {s.name} <span className="text-muted-foreground">({s.rural_line})</span>
                    </span>
                    <span className="font-semibold capitalize">{s.risk_level}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="font-semibold">Ocorrências por categoria</h2>
            <ul className="flex flex-col gap-1.5 text-sm">
              {Object.entries(data.reports_by_category).map(([cat, n]) => (
                <li key={cat} className="flex justify-between">
                  <span>{CATEGORY_LABELS[cat as ReportCategory] ?? cat}</span>
                  <span className="text-muted-foreground">{n}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="font-semibold">Regiões mais afetadas</h2>
            <ul className="flex flex-col gap-1.5 text-sm">
              {data.affected_regions.slice(0, 6).map((r) => (
                <li key={r.rural_line} className="flex justify-between">
                  <span>{r.rural_line}</span>
                  <span className="text-muted-foreground">{r.count} relato(s)</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="font-semibold">Recomendações de prioridade</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {data.priority_recommendations.map((rec) => (
                <li key={rec} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
