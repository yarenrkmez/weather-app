import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type WeatherSettings = {
  refetchIntervalMs: number;
  staleTimeMs: number;
  gcTimeMs: number;
  refetchOnWindowFocus: boolean;
  refetchOnReconnect: boolean;
  retry: number | boolean;
};

const DEFAULTS: WeatherSettings = {
  refetchIntervalMs: 10 * 60 * 1000,
  staleTimeMs: 5 * 60 * 1000,
  gcTimeMs: 30 * 60 * 1000,
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
  retry: 1,
};

const STORAGE_KEY = "weather-settings";

type Ctx = {
  settings: WeatherSettings;
  update: (patch: Partial<WeatherSettings>) => void;
  reset: () => void;
};

const WeatherSettingsContext = createContext<Ctx | null>(null);

export const WeatherSettingsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [settings, setSettings] = useState<WeatherSettings>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULTS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULTS, ...parsed };
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const value = useMemo<Ctx>(
    () => ({
      settings,
      update: (patch) => setSettings((s) => ({ ...s, ...patch })),
      reset: () => setSettings(DEFAULTS),
    }),
    [settings]
  );

  return (
    <WeatherSettingsContext.Provider value={value}>
      {children}
    </WeatherSettingsContext.Provider>
  );
};

export function useWeatherSettings() {
  const ctx = useContext(WeatherSettingsContext);
  if (!ctx)
    throw new Error(
      "useWeatherSettings must be used within WeatherSettingsProvider"
    );
  return ctx;
}
