/**
 * Serializadores: transformam registros no formato da API.
 * Constroem a geometria GeoJSON e enriquecem o detalhe do trecho com a análise.
 */
import type { Report, Segment, SegmentDetail } from "@/lib/types";

import { calculateTrafficIndex } from "./scoring";

export function buildGeometry(segment: Segment): Segment["geometry"] {
  const coords = segment.coordinates;
  if (!coords || coords.length === 0) return null;
  return { type: "LineString", coordinates: coords };
}

/** Versão de lista/mapa: trecho + geometria GeoJSON. */
export function serializeSegment(segment: Segment): Segment {
  return { ...segment, geometry: buildGeometry(segment) };
}

/** Versão detalhada (painel lateral): recalcula a análise ao vivo. */
export function serializeSegmentDetail(segment: Segment, reports: Report[]): SegmentDetail {
  // Mantém coerência com scoreFields: ignora denúncias resolvidas.
  const active = reports.filter((r) => r.status !== "resolvida");
  const result = calculateTrafficIndex({
    accumulatedRain72h: segment.accumulated_rain_72h ?? 0,
    forecastRain7d: segment.forecast_rain_7d ?? 0,
    slope: segment.slope ?? 0,
    reports: active,
  });
  return {
    ...serializeSegment(segment),
    risk_score: result.score,
    risk_level: result.level,
    explanation: result.explanation,
    recommendations: result.recommendations,
    factors: result.factors,
  };
}
