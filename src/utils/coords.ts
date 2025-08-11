import { GeocodingResult } from "schemas/openMeteo";

export type Coords = { lat: number; lon: number };

export function toCoords(
  input:
    | GeocodingResult
    | { latitude: number; longitude: number }
    | { lat: number; lon: number }
): Coords {
  if ("latitude" in input) return { lat: input.latitude, lon: input.longitude };
  return { lat: (input as any).lat, lon: (input as any).lon };
}
