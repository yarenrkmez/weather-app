import { GeocodingResponseSchema, ForecastResponseSchema } from "./openMeteo";

test("geocoding parse - valid", () => {
  const ok = { results: [{ name: "Istanbul", latitude: 41, longitude: 29 }] };
  const parsed = GeocodingResponseSchema.parse(ok);
  expect(parsed.results[0].name).toBe("Istanbul");
});

test("geocoding parse - invalid latitude", () => {
  const bad = {
    results: [{ name: "Istanbul", latitude: "41", longitude: 29 }],
  };
  expect(() => GeocodingResponseSchema.parse(bad as any)).toThrow();
});

test("forecast parse - arrays aligned", () => {
  const ok = {
    latitude: 41,
    longitude: 29,
    current_weather: {
      temperature: 26,
      windspeed: 5,
      winddirection: 180,
      weathercode: 0,
      is_day: 1,
      time: "2025-08-11T10:00",
    },
    daily: {
      time: ["2025-08-11", "2025-08-12"],
      temperature_2m_max: [30, 31],
      temperature_2m_min: [20, 21],
      precipitation_sum: [0, 1],
    },
  };
  expect(() => ForecastResponseSchema.parse(ok)).not.toThrow();
});

test("forecast parse - arrays misaligned -> error", () => {
  const bad = {
    latitude: 41,
    longitude: 29,
    current_weather: {
      temperature: 26,
      windspeed: 5,
      winddirection: 180,
      weathercode: 0,
      is_day: 1,
      time: "2025-08-11T10:00",
    },
    daily: {
      time: ["2025-08-11"],
      temperature_2m_max: [30, 31],
      temperature_2m_min: [20, 21],
    },
  };
  expect(() => ForecastResponseSchema.parse(bad as any)).toThrow(
    /Daily arrays/
  );
});
