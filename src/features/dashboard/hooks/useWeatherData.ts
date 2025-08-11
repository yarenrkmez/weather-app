import { useQuery } from "@tanstack/react-query";
import { fetchCoordinatesByCity } from "services/geocodingService";
import { fetchCurrentWeatherByCoords } from "services/weatherService";
import { ForecastResponse, GeocodingResult } from "schemas/openMeteo";

type Coords = { latitude?: number; longitude?: number };
type Input = string | Coords | undefined;

const REFRESH_MS = 1 * 60 * 1000;

export function useWeatherData(input?: Input) {
  const isString = typeof input === "string";
  const city = isString ? (input as string) : undefined;
  const latIn = !isString ? (input as Coords | undefined)?.latitude : undefined;
  const lonIn = !isString
    ? (input as Coords | undefined)?.longitude
    : undefined;

  const coordsQuery = useQuery<GeocodingResult | undefined, Error>({
    queryKey: ["geocode", city],
    enabled: !!city && (latIn == null || lonIn == null),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    queryFn: async () => {
      if (!city) return undefined;
      const res = await fetchCoordinatesByCity(city);
      return res?.[0];
    },
  });

  const lat = (
    Number.isFinite(latIn) ? (latIn as number) : coordsQuery.data?.latitude
  ) as number | undefined;
  const lon = (
    Number.isFinite(lonIn) ? (lonIn as number) : coordsQuery.data?.longitude
  ) as number | undefined;

  const weatherQuery = useQuery<ForecastResponse, Error>({
    queryKey: ["weather", lat, lon],
    enabled: typeof lat === "number" && typeof lon === "number",
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: REFRESH_MS,
    queryFn: async () => {
      return fetchCurrentWeatherByCoords(lat!, lon!);
    },
    refetchIntervalInBackground: true,
  });

  return {
    coords: coordsQuery.data,
    coordsStatus: {
      isLoading: coordsQuery.isLoading,
      isError: coordsQuery.isError,
      isFetching: coordsQuery.isFetching,
      error: coordsQuery.error,
    },
    weather: weatherQuery.data,
    weatherStatus: {
      isLoading: weatherQuery.isLoading,
      isError: weatherQuery.isError,
      isFetching: weatherQuery.isFetching,
      error: weatherQuery.error,
    },
    weatherQuery,
  };
}
