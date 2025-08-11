import { z } from "zod";

export const GeocodingResultSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  admin1: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  population: z.number().optional(),
  timezone: z.string().optional(),
});

export const GeocodingResponseSchema = z
  .object({
    results: z.array(GeocodingResultSchema).default([]),
    generationtime_ms: z.number().optional(),
  })
  .passthrough();

export type GeocodingResult = z.infer<typeof GeocodingResultSchema>;
export type GeocodingResponse = z.infer<typeof GeocodingResponseSchema>;

export const CurrentWeatherSchema = z.object({
  temperature: z.number(),
  windspeed: z.number(),
  winddirection: z.number(),
  weathercode: z.number(),
  is_day: z.number().int(),
  time: z.string(),
});

export const DailyUnitsSchema = z
  .object({
    time: z.string(),
    temperature_2m_max: z.string(),
    temperature_2m_min: z.string(),
    precipitation_sum: z.string().optional(),
  })
  .passthrough();

export const DailySchema = z
  .object({
    time: z.array(z.string()),
    temperature_2m_max: z.array(z.number()),
    temperature_2m_min: z.array(z.number()),
    precipitation_sum: z.array(z.number()).optional(),
  })
  .refine(
    (d) =>
      d.time.length === d.temperature_2m_max.length &&
      d.time.length === d.temperature_2m_min.length &&
      (d.precipitation_sum
        ? d.time.length === d.precipitation_sum.length
        : true),
    { message: "Daily arrays must have the same length" }
  );

export const HourlySchema = z
  .object({
    time: z.array(z.string()),
    relative_humidity_2m: z.array(z.number()),
  })
  .optional();

export const ForecastResponseSchema = z
  .object({
    latitude: z.number(),
    longitude: z.number(),
    timezone: z.string().optional(),
    current_weather: CurrentWeatherSchema,
    daily_units: DailyUnitsSchema.optional(),
    daily: DailySchema,
    hourly: HourlySchema,
  })
  .passthrough();

export type ForecastResponse = z.infer<typeof ForecastResponseSchema>;
