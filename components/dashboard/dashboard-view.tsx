"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Download,
  FileText,
  Gauge,
  ListChecks,
  MapPinned,
} from "lucide-react";

import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { exportCsvUrl } from "@/lib/api-client";
import { CATEGORY_LABELS, SEVERITY_LABELS, STATUS_LABELS } from "@/lib/labels";
import { RISK_COLORS } from "@/lib/risk";
import {
  REPORT_CATEGORIES,
  REPORT_STATUSES,
  RISK_LEVELS,
  type Report,
  type RiskLevel,
  type Segment,
} from "@/lib/types";

const fieldClass =
  "h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const HeatmapMap = dynamic(() => import("./heatmap-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Carregando mapa…
    </div>
  ),
});

interface Summary {
  total_segments: number;
  critical_segments: number;
  high_segments: number;
  open_reports: number;
  resolved_reports: number;
  average_index: number;
}

const PERIODS = [
  { value: "all", label: "Todo o período" },
  { value: "1", label: "Últimas 24h" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
];

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function DashboardView({
  summary,
  criticalSegments,
  reports,
  segments,
  categoryCounts,
}: {
  summary: Summary;
  criticalSegments: Segment[];
  reports: Report[];
  segments: Segment[];
  categoryCounts: Array<{ category: string; count: number }>;
}) {
  const [ruralLine, setRuralLine] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [period, setPeriod] = useState("all");

  const segMap = useMemo(
    () => new Map(segments.map((s) => [String(s.id), s])),
    [segments],
  );
  const ruralLines = useMemo(
    () => Array.from(new Set(segments.map((s) => s.rural_line))).sort(),
    [segments],
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    return reports.filter((r) => {
      const seg = r.road_segment_id ? segMap.get(String(r.road_segment_id)) : undefined;
      if (ruralLine && seg?.rural_line !== ruralLine) return false;
      if (riskLevel && seg?.risk_level !== riskLevel) return false;
      if (status && r.status !== status) return false;
      if (category && r.category !== category) return false;
      if (period !== "all" && r.created_at) {
        const ageDays = (now - new Date(r.created_at).getTime()) / 86_400_000;
        if (ageDays > Number(period)) return false;
      }
      return true;
    });
  }, [reports, segMap, ruralLine, riskLevel, status, category, period]);

  const heatPoints = useMemo(
    () =>
      filtered
        .filter((r) => r.latitude != null && r.longitude != null)
        .map((r) => {
          const intensity =
            r.severity === "critica" ? 1 : r.severity === "alta" ? 0.7 : r.severity === "media" ? 0.4 : 0.2;
          return [r.latitude as number, r.longitude as number, intensity] as [
            number,
            number,
            number,
          ];
        }),
    [filtered],
  );

  const maxCat = Math.max(1, ...categoryCounts.map((c) => c.count));

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho + ações */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard da Secretaria</h1>
          <p className="text-muted-foreground">
            Priorize a manutenção preventiva das linhas vicinais de Ariquemes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href={exportCsvUrl} download>
              <Download /> Exportar CSV
            </a>
          </Button>
          <Button asChild>
            <Link href="/relatorios">
              <FileText /> Relatório semanal
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard icon={<MapPinned />} label="Trechos monitorados" value={summary.total_segments} />
        <StatCard
          icon={<AlertTriangle />}
          label="Trechos críticos"
          value={summary.critical_segments}
          danger
        />
        <StatCard icon={<ListChecks />} label="Ocorrências abertas" value={summary.open_reports} />
        <StatCard
          icon={<ListChecks />}
          label="Ocorrências resolvidas"
          value={summary.resolved_reports}
        />
        <StatCard icon={<Gauge />} label="Índice médio" value={summary.average_index} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lista priorizada de críticos */}
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="font-semibold">Trechos prioritários</h2>
            {criticalSegments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum trecho crítico no momento.</p>
            ) : (
              <ul className="flex flex-col divide-y">
                {criticalSegments.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.rural_line}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: RISK_COLORS[s.risk_level] }}>
                        {s.risk_score.toFixed(0)}
                      </span>
                      <RiskBadge level={s.risk_level} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Ocorrências por categoria */}
        <Card>
          <CardContent className="flex flex-col gap-3 p-5">
            <h2 className="font-semibold">Ocorrências por categoria</h2>
            {categoryCounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem ocorrências registradas.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {categoryCounts.map((c) => (
                  <li key={c.category} className="flex flex-col gap-1">
                    <div className="flex justify-between text-sm">
                      <span>{CATEGORY_LABELS[c.category as keyof typeof CATEGORY_LABELS] ?? c.category}</span>
                      <span className="text-muted-foreground">{c.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(c.count / maxCat) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mapa de calor */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-5">
          <h2 className="font-semibold">Mapa de calor das denúncias</h2>
          <div className="h-[320px] w-full overflow-hidden rounded-lg border">
            {heatPoints.length > 0 ? (
              <HeatmapMap points={heatPoints} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhuma denúncia georreferenciada no filtro atual.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de ocorrências + filtros */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <h2 className="font-semibold">Ocorrências recentes</h2>

          <div className="flex flex-wrap gap-2">
            <select className={fieldClass} value={ruralLine} onChange={(e) => setRuralLine(e.target.value)}>
              <option value="">Todas as linhas</option>
              {ruralLines.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <select className={fieldClass} value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
              <option value="">Todos os riscos</option>
              {RISK_LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            <select className={fieldClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {REPORT_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <select className={fieldClass} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Todas as categorias</option>
              {REPORT_CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
            <select className={fieldClass} value={period} onChange={(e) => setPeriod(e.target.value)}>
              {PERIODS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Data</th>
                  <th className="py-2 pr-3 font-medium">Trecho</th>
                  <th className="py-2 pr-3 font-medium">Categoria</th>
                  <th className="py-2 pr-3 font-medium">Severidade</th>
                  <th className="py-2 pr-3 font-medium">Status</th>
                  <th className="py-2 font-medium">Relator</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-muted-foreground">
                      Nenhuma ocorrência para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const seg = r.road_segment_id ? segMap.get(String(r.road_segment_id)) : undefined;
                    return (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-2 pr-3 whitespace-nowrap text-muted-foreground">
                          {formatDateTime(r.created_at)}
                        </td>
                        <td className="py-2 pr-3">{seg?.rural_line ?? "—"}</td>
                        <td className="py-2 pr-3">{CATEGORY_LABELS[r.category]}</td>
                        <td className="py-2 pr-3">{SEVERITY_LABELS[r.severity]}</td>
                        <td className="py-2 pr-3">
                          <StatusPill status={r.status} />
                        </td>
                        <td className="py-2 text-muted-foreground">{r.reporter_name ?? "Anônimo"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <span
          className={
            danger
              ? "flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive [&_svg]:h-4 [&_svg]:w-4"
              : "flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:h-4 [&_svg]:w-4"
          }
        >
          {icon}
        </span>
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: Report["status"] }) {
  const styles: Record<string, string> = {
    aberta: "bg-[hsl(var(--risk-alto)/0.14)] text-[hsl(var(--risk-alto))]",
    em_analise: "bg-[hsl(var(--risk-medio)/0.16)] text-[hsl(38_92%_38%)]",
    resolvida: "bg-[hsl(var(--risk-baixo)/0.14)] text-[hsl(var(--risk-baixo))]",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
