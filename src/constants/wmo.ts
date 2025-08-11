export type WmoEntry = {
  key: string;
  icon: string;
  icon_day?: string;
  icon_night?: string;
  kind?:
    | "clear"
    | "clouds"
    | "fog"
    | "drizzle"
    | "rain"
    | "freezing_drizzle"
    | "freezing_rain"
    | "snow"
    | "snow_grains"
    | "showers"
    | "snow_showers"
    | "thunder";
  severity?: "light" | "moderate" | "heavy" | "violent";
};

export const DEFAULT_WMO = { key: "weather.unknown", icon: "🌈" } as const;

export const WMO_MAP = {
  0: {
    key: "weather.clear_sky",
    icon: "☀️",
    icon_day: "☀️",
    icon_night: "🌙",
    kind: "clear",
  },
  1: {
    key: "weather.partly_cloudy",
    icon: "🌤️",
    icon_day: "🌤️",
    icon_night: "☁️",
    kind: "clouds",
  },
  2: {
    key: "weather.partly_cloudy",
    icon: "⛅",
    icon_day: "⛅",
    icon_night: "☁️",
    kind: "clouds",
  },
  3: { key: "weather.cloudy", icon: "☁️", kind: "clouds" },

  45: { key: "weather.fog", icon: "🌫️", kind: "fog" },
  48: { key: "weather.fog", icon: "🌫️", kind: "fog" },

  51: {
    key: "weather.drizzle_light",
    icon: "🌦️",
    kind: "drizzle",
    severity: "light",
  },
  53: {
    key: "weather.drizzle",
    icon: "🌦️",
    kind: "drizzle",
    severity: "moderate",
  },
  55: {
    key: "weather.drizzle_heavy",
    icon: "🌧️",
    kind: "drizzle",
    severity: "heavy",
  },

  56: {
    key: "weather.freezing_drizzle_light",
    icon: "🌧️",
    kind: "freezing_drizzle",
    severity: "light",
  },
  57: {
    key: "weather.freezing_drizzle_heavy",
    icon: "🌧️",
    kind: "freezing_drizzle",
    severity: "heavy",
  },

  61: {
    key: "weather.rainy_light",
    icon: "🌧️",
    kind: "rain",
    severity: "light",
  },
  63: { key: "weather.rainy", icon: "🌧️", kind: "rain", severity: "moderate" },
  65: {
    key: "weather.rain_heavy",
    icon: "🌧️",
    kind: "rain",
    severity: "heavy",
  },

  66: {
    key: "weather.freezing_rain",
    icon: "🌧️",
    kind: "freezing_rain",
    severity: "moderate",
  },
  67: {
    key: "weather.freezing_rain_heavy",
    icon: "🌧️",
    kind: "freezing_rain",
    severity: "heavy",
  },

  71: {
    key: "weather.snow_light",
    icon: "❄️",
    kind: "snow",
    severity: "light",
  },
  73: { key: "weather.snow", icon: "❄️", kind: "snow", severity: "moderate" },
  75: {
    key: "weather.snow_heavy",
    icon: "❄️",
    kind: "snow",
    severity: "heavy",
  },

  77: { key: "weather.snow_grains", icon: "❄️", kind: "snow_grains" },

  80: {
    key: "weather.shower_light",
    icon: "🌦️",
    kind: "showers",
    severity: "light",
  },
  81: {
    key: "weather.shower",
    icon: "🌧️",
    kind: "showers",
    severity: "moderate",
  },
  82: {
    key: "weather.shower_heavy",
    icon: "⛈️",
    kind: "showers",
    severity: "heavy",
  },

  85: {
    key: "weather.snow_showers",
    icon: "🌨️",
    kind: "snow_showers",
    severity: "moderate",
  },
  86: {
    key: "weather.snow_showers_heavy",
    icon: "❄️",
    kind: "snow_showers",
    severity: "heavy",
  },

  95: {
    key: "weather.thunderstorm",
    icon: "⛈️",
    kind: "thunder",
    severity: "moderate",
  },
  96: {
    key: "weather.thunderstorm_hail",
    icon: "⛈️",
    kind: "thunder",
    severity: "heavy",
  },
  99: {
    key: "weather.thunderstorm_hail_heavy",
    icon: "⛈️",
    kind: "thunder",
    severity: "violent",
  },
} as const satisfies Record<
  number,
  {
    key: string;
    icon: string;
    icon_day?: string;
    icon_night?: string;
    kind?: WmoEntry["kind"];
    severity?: WmoEntry["severity"];
  }
>;

export function mapWmo(code?: number, isDay?: number | boolean) {
  if (code == null) return DEFAULT_WMO;

  const entry = (WMO_MAP as Record<number, WmoEntry>)[code];
  if (!entry) return DEFAULT_WMO;

  const day = typeof isDay === "boolean" ? isDay : isDay === 1;
  const icon =
    (day ? entry.icon_day : entry.icon_night) || entry.icon || DEFAULT_WMO.icon;

  return {
    key: entry.key,
    icon,
    kind: entry.kind,
    severity: entry.severity,
  } as const;
}
