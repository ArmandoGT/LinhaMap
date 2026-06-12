/**
 * Integração meteorológica (Open-Meteo) — Seção 7. Porte de weather.py.
 * Ponto de integração para o worker (Etapa 16). Opcional: falha => null.
 */
import { config } from "@/lib/config";
import type { DailyForecast } from "@/lib/types";

export async function fetchPrecipitationForecast(
  latitude: number,
  longitude: number,
): Promise<{ forecast_rain_7d: number; forecast_daily: DailyForecast[] } | null> {
  try {
    const url = new URL(config.openMeteoBaseUrl);
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("daily", "precipitation_sum");
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("timezone", "America/Porto_Velho");

    const resp = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!resp.ok) return null;
    const json = (await resp.json()) as {
      daily?: { time?: string[]; precipitation_sum?: number[] };
    };
    const days = json.daily?.time ?? [];
    const sums = json.daily?.precipitation_sum ?? [];
    const forecast_daily: DailyForecast[] = days.map((date, i) => ({
      date,
      mm: Number(sums[i] ?? 0),
    }));
    const total = Math.round(forecast_daily.reduce((a, f) => a + f.mm, 0) * 10) / 10;
    return { forecast_rain_7d: total, forecast_daily };
  } catch {
    return null; // sem rede/erro => mantém os dados atuais
  }
}
