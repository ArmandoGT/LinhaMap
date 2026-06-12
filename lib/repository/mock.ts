/**
 * Repositório em memória — porte de MockRepository (repository.py).
 * Semeado a partir de lib/mock-data; permite rodar sem Supabase (Regra 10).
 */
import { MOCK_REPORTS, MOCK_SEGMENTS } from "@/lib/mock-data";
import type { ProcessingLog, Report, Segment } from "@/lib/types";

import { type ReportFilters, type Repository, scoreFields } from "./base";

function uuid(): string {
  return crypto.randomUUID();
}
function nowIso(): string {
  return new Date().toISOString();
}

export class MockRepository implements Repository {
  private segments: Segment[];
  private reports: Report[];
  private logs: ProcessingLog[] = [];

  constructor() {
    this.segments = structuredClone(MOCK_SEGMENTS);
    this.reports = structuredClone(MOCK_REPORTS);
    // Recalcula já na carga para a lista refletir scores coerentes.
    void this.recalculateAll();
  }

  // --- helpers ---
  private findSegment(id: string): Segment | undefined {
    return this.segments.find((s) => String(s.id) === String(id));
  }
  private findReport(id: string): Report | undefined {
    return this.reports.find((r) => String(r.id) === String(id));
  }
  private recalcSegment(id: string): void {
    const seg = this.findSegment(id);
    if (seg) Object.assign(seg, scoreFields(seg, this.reportsForSegmentSync(id)));
  }
  private reportsForSegmentSync(id: string): Report[] {
    return this.reports.filter((r) => String(r.road_segment_id) === String(id));
  }

  // --- Trechos ---
  async listSegments(): Promise<Segment[]> {
    return structuredClone(this.segments);
  }
  async getSegment(id: string): Promise<Segment | null> {
    const seg = this.findSegment(id);
    return seg ? structuredClone(seg) : null;
  }
  async createSegment(data: Partial<Segment>): Promise<Segment> {
    const seg = {
      id: uuid(),
      reports_count: 0,
      risk_score: 0,
      risk_level: "baixo",
      explanation: null,
      updated_at: nowIso(),
      ...data,
    } as Segment;
    Object.assign(seg, scoreFields(seg, []));
    this.segments.push(seg);
    return structuredClone(seg);
  }
  async updateSegment(id: string, data: Partial<Segment>): Promise<Segment | null> {
    const seg = this.findSegment(id);
    if (!seg) return null;
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined && v !== null) (seg as unknown as Record<string, unknown>)[k] = v;
    }
    Object.assign(seg, scoreFields(seg, this.reportsForSegmentSync(id)));
    return structuredClone(seg);
  }
  async deleteSegment(id: string): Promise<boolean> {
    const idx = this.segments.findIndex((s) => String(s.id) === String(id));
    if (idx === -1) return false;
    this.segments.splice(idx, 1);
    for (const r of this.reports) {
      if (String(r.road_segment_id) === String(id)) r.road_segment_id = null;
    }
    return true;
  }
  async reportsForSegment(id: string): Promise<Report[]> {
    return structuredClone(this.reportsForSegmentSync(id));
  }
  async recalculateAll(): Promise<number> {
    for (const seg of this.segments) {
      Object.assign(seg, scoreFields(seg, this.reportsForSegmentSync(seg.id)));
    }
    return this.segments.length;
  }

  // --- Denúncias ---
  async listReports(filters: ReportFilters = {}): Promise<Report[]> {
    let rows = this.reports;
    if (filters.status) rows = rows.filter((r) => r.status === filters.status);
    if (filters.category) rows = rows.filter((r) => r.category === filters.category);
    if (filters.road_segment_id)
      rows = rows.filter((r) => String(r.road_segment_id) === String(filters.road_segment_id));
    rows = [...rows].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    return structuredClone(rows);
  }
  async getReport(id: string): Promise<Report | null> {
    const r = this.findReport(id);
    return r ? structuredClone(r) : null;
  }
  async createReport(data: Partial<Report>): Promise<Report> {
    const report = {
      id: uuid(),
      category: "outro",
      severity: "media",
      confidence: null,
      status: "aberta",
      created_at: nowIso(),
      updated_at: nowIso(),
      ...data,
    } as Report;
    this.reports.push(report);
    if (report.road_segment_id) this.recalcSegment(report.road_segment_id);
    return structuredClone(report);
  }
  async updateReport(id: string, data: Partial<Report>): Promise<Report | null> {
    const r = this.findReport(id);
    if (!r) return null;
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined && v !== null) (r as unknown as Record<string, unknown>)[k] = v;
    }
    r.updated_at = nowIso();
    if (r.road_segment_id) this.recalcSegment(r.road_segment_id);
    return structuredClone(r);
  }
  async deleteReport(id: string): Promise<boolean> {
    const idx = this.reports.findIndex((r) => String(r.id) === String(id));
    if (idx === -1) return false;
    const segId = this.reports[idx].road_segment_id;
    this.reports.splice(idx, 1);
    if (segId) this.recalcSegment(segId);
    return true;
  }
  async setReportStatus(id: string, status: string): Promise<Report | null> {
    return this.updateReport(id, { status: status as Report["status"] });
  }

  // --- Logs ---
  async addProcessingLog(status: string, message: string): Promise<ProcessingLog> {
    const log: ProcessingLog = {
      id: uuid(),
      execution_date: nowIso(),
      status,
      message,
      created_at: nowIso(),
    };
    this.logs.push(log);
    return structuredClone(log);
  }
  async listProcessingLogs(limit = 20): Promise<ProcessingLog[]> {
    const rows = [...this.logs].sort((a, b) =>
      b.execution_date.localeCompare(a.execution_date),
    );
    return structuredClone(rows.slice(0, limit));
  }
}
