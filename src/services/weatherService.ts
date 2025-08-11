import { fetchWithSchema } from "./http";
import { ForecastResponseSchema, ForecastResponse } from "schemas/openMeteo";

const BASE = "https://api.open-meteo.com/v1/forecast";

export function buildForecastUrl(lat: number, lon: number) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current_weather: "true",
    daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
    hourly: "relative_humidity_2m",
    timezone: "auto",
  });
  return `${BASE}?${params.toString()}`;
}

export async function fetchCurrentWeatherByCoords(
  lat: number,
  lon: number
): Promise<ForecastResponse> {
  const url = buildForecastUrl(lat, lon);
  return fetchWithSchema(url, ForecastResponseSchema);
}
