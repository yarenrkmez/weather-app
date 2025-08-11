import React from "react";
import styles from "./Dashboard.module.scss";
import { useTranslation } from "react-i18next";
import { useQueries } from "@tanstack/react-query";
import { useCityWeather } from "contexts/CityWeatherContext";
import { fetchCoordinatesByCity } from "services/geocodingService";
import { fetchCurrentWeatherByCoords } from "services/weatherService";
import AddCityForm from "features/addCity/AddCityForm";
import CityWeatherCard from "features/dashboard/components/CityWeatherCard/CityWeatherCard";
import { mapWmo } from "constants/wmo";
import UseCurrentLocationButton from "components/atoms/UseCurrentLocationButton/UseCurrentLocationButton";

const REFRESH_MS = 1 * 60 * 1000;

type CardForecast = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
};

type CardCurrentWeatherUnits = {
  time: string;
  interval: string;
  temperature: string;
  windspeed: string;
  winddirection: string;
  is_day: string;
  weathercode: string;
};

type CardData = {
  city: string;
  temperature: number;
  description: string;
  icon?: string;
  windSpeed: number;
  humidity: number;
  forecast: CardForecast;
  currentWeatherUnits: CardCurrentWeatherUnits;
  latitude: number;
  longitude: number;
};

function nearestIndexToNow(times?: string[]) {
  if (!times?.length) return -1;
  const now = Date.now();
  let best = -1;
  let bestDiff = Number.POSITIVE_INFINITY;
  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]).getTime();
    const diff = Math.abs(t - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return best;
}

function pickCurrentHumidity(hourly?: {
  time: string[];
  relative_humidity_2m: number[];
}) {
  const times = hourly?.time ?? [];
  const hums = hourly?.relative_humidity_2m ?? [];
  if (!times.length || !hums.length) return undefined;
  const idx = nearestIndexToNow(times);
  const val = idx > -1 ? Number(hums[idx]) : NaN;
  return Number.isFinite(val) ? val : undefined;
}

function describeWeather(
  code?: number,
  isDay?: number | boolean,
  t?: (key: string) => string
) {
  const normCode = Number.isFinite(Number(code)) ? Number(code) : undefined;
  const { key, icon } = mapWmo(normCode, isDay);
  return { text: t ? t(key) : key, key, icon };
}

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { cities, removeCity } = useCityWeather();

  const language = i18n.language?.split("-")[0] ?? "tr";

  const queries = useQueries({
    queries: (cities || []).map((cw) => {
      const name = typeof cw === "string" ? cw : cw.city;
      const latPreset = typeof cw === "string" ? undefined : cw.latitude;
      const lonPreset = typeof cw === "string" ? undefined : cw.longitude;

      return {
        queryKey: ["dashboard", "card", name, language] as const,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchInterval: REFRESH_MS,
        queryFn: async (): Promise<CardData> => {
          let useLat = latPreset;
          let useLon = lonPreset;

          if (useLat == null || useLon == null) {
            const geos = await fetchCoordinatesByCity(name, {
              limit: 1,
              language,
            });
            const first = geos?.[0];
            if (!first) throw new Error(`No coordinates for ${name}`);
            useLat = first.latitude;
            useLon = first.longitude;
          }

          const weather = await fetchCurrentWeatherByCoords(useLat!, useLon!);

          const current = weather.current_weather;
          const daily = weather.daily;
          const hum = pickCurrentHumidity(weather.hourly);
          const dw = describeWeather(current.weathercode, current.is_day, t);

          const times = daily?.time ?? [];
          const tmax = daily?.temperature_2m_max ?? [];
          const tmin = daily?.temperature_2m_min ?? [];
          const prcp = daily?.precipitation_sum ?? Array(times.length).fill(0);

          const forecast: CardForecast = {
            time: times,
            temperature_2m_max: tmax,
            temperature_2m_min: tmin,
            precipitation_sum: prcp,
          };

          const currentUnits: CardCurrentWeatherUnits = {
            time: "ISO",
            interval: "min",
            temperature: "°C",
            windspeed: "km/h",
            winddirection: "°",
            is_day: "0/1",
            weathercode: "WMO",
          };

          return {
            city: name,
            temperature: Number(current.temperature) || 0,
            description: dw.text,
            icon: dw.icon,
            windSpeed: Number(current.windspeed) || 0,
            humidity: typeof hum === "number" ? hum : 0,
            forecast,
            currentWeatherUnits: currentUnits,
            latitude: useLat!,
            longitude: useLon!,
          };
        },
        refetchIntervalInBackground: true,
      };
    }),
  });

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>{t("dashboard.title", "Hava Durumu")}</h1>
      <UseCurrentLocationButton />
      <AddCityForm />

      <section className={styles.cards}>
        {queries.length === 0 && (
          <p className={styles.empty}>
            {t("dashboard.empty", "Şehir ekleyin ve başlayın.")}
          </p>
        )}

        {queries.map((q, idx) => {
          const cw = cities[idx];
          const name = typeof cw === "string" ? cw : cw.city;

          if (q.isLoading || q.isFetching) {
            return (
              <div className={styles.cardSkeleton} key={`sk-${name}-${idx}`}>
                <div className={styles.skelHeader} />
                <div className={styles.skelBody} />
              </div>
            );
          }

          if (q.isError) {
            return (
              <div className={styles.cardError} key={`err-${name}-${idx}`}>
                <strong>{name}</strong>
                <div>{t("dashboard.load_error", "Yüklenemedi")}</div>
                <button onClick={() => removeCity(name)}>
                  {t("remove", "Kaldır")}
                </button>
              </div>
            );
          }

          const data = q.data as CardData;

          return (
            <CityWeatherCard
              key={`${data.city}-${idx}`}
              city={data.city}
              temperature={data.temperature}
              description={data.description}
              icon={data.icon}
              humidity={data.humidity}
              windSpeed={data.windSpeed}
              forecast={data.forecast}
              currentWeatherUnits={data.currentWeatherUnits}
              latitude={data.latitude}
              longitude={data.longitude}
              onRemove={() => removeCity(name)}
              onRefresh={() => q.refetch()}
            />
          );
        })}
      </section>
    </div>
  );
};

export default Dashboard;
