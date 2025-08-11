import { fetchWithSchema } from "./http";
import { GeocodingResponseSchema, GeocodingResult } from "schemas/openMeteo";

const BASE = "https://geocoding-api.open-meteo.com/v1/search";

export async function fetchCoordinatesByCity(
  name: string,
  opts: { limit?: number; language?: string } = {}
): Promise<GeocodingResult[]> {
  if (!name?.trim()) return [];
  const count = String(opts.limit ?? 10);
  const lang = opts.language ?? "tr";
  const url = `${BASE}?name=${encodeURIComponent(
    name
  )}&count=${count}&language=${lang}&format=json`;
  const data = await fetchWithSchema(url, GeocodingResponseSchema);
  return data.results ?? [];
}
