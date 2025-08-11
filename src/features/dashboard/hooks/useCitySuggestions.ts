import { useQuery } from "@tanstack/react-query";
import { fetchCoordinatesByCity } from "services/geocodingService";

type SuggestionOpts = { limit?: number; language?: string };

export function useCitySuggestions(query: string, opts: SuggestionOpts = {}) {
  return useQuery({
    queryKey: ["geocode", query, opts.limit ?? 10, opts.language ?? "tr"],
    enabled: !!query?.trim(),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    queryFn: () => fetchCoordinatesByCity(query, opts),
  });
}
