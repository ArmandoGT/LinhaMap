/**
 * Serviços do Dashboard da Secretaria (Seção 6.6) — porte de dashboard.py.
 * Funções puras: cards, lista de críticos, ocorrências por categoria e CSV.
 */
import type { Report, Segment } from "@/lib/types";

export function buildSummary(segments: Segment[], reports: Report[]) {
  const scores = segments.map((s) => s.risk_score ?? 0);
  return {
    total_segments: segments.length,
    critical_segments: segments.filter((s) => s.risk_level === "critico").length,
    high_segments: segments.filter((s) => s.risk_level === "alto").length,
    open_reports: reports.filter((r) => r.status === "aberta").length,
    resolved_reports: reports.filter((r) => r.status === "resolvida").length,
    average_index: scores.length
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0,
  };
}

export function criticalSegments(segments: Segment[]): Segment[] {
  return segments
    .filter((s) => s.risk_level === "alto" || s.risk_level === "critico")
    .sort((a, b) => (b.risk_score ?? 0) - (a.risk_score ?? 0));
}

export function reportsByCategory(reports: Report[]): Array<{ category: string; count: number }> {
  const counts: Record<string, number> = {};
  for (const r of reports) {
    const cat = r.category ?? "outro";
    counts[cat] = (counts[cat] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

const CSV_COLUMNS = [
  "id",
  "created_at",
  "reporter_name",
  "phone",
  "rural_line",
  "road_segment_id",
  "latitude",
  "longitude",
  "category",
  "severity",
  "status",
  "confidence",
  "description",
] as const;

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  // Escapa aspas e envolve em aspas se houver vírgula/quebra/aspas.
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function reportsToCsv(reports: Report[], segments: Segment[]): string {
  const segLine = new Map(segments.map((s) => [String(s.id), s.rural_line]));
  const lines = [CSV_COLUMNS.join(",")];
  for (const r of reports) {
    const row: Record<string, unknown> = {
      ...r,
      rural_line: segLine.get(String(r.road_segment_id)) ?? "",
    };
    lines.push(CSV_COLUMNS.map((c) => csvCell(row[c])).join(","));
  }
  return lines.join("\n");
}
