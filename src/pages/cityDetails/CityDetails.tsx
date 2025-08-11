import React, { useCallback, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./CityDetails.module.scss";
import { useWeatherData } from "features/dashboard/hooks/useWeatherData";
import { mapOpenMeteoToCard } from "utils/weatherMapper";
import DailyTableSkeleton from "components/molecules/skeletons/DailyTableSkeleton";
import DetailCardSkeleton from "components/molecules/skeletons/DetailCardSkeleton";

type MappedRow = {
  date: string;
  min: number | null;
  max: number | null;
  precipitation: number | null;
  humidityAvg: number | null;
};

type MappedWeather = {
  temperature: number;
  description: string;
  descriptionKey: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  windDirectionDeg: number | null;
  windDirectionText: string;
  isDay: boolean;
  code: number | null;
  forecast: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    humidity_avg_by_date: Record<string, number>;
    rows?: MappedRow[];
  };
  current_weather_units?: Record<string, string>;
  daily_units?: Record<string, string>;
  units?: { current?: Record<string, string>; daily?: Record<string, string> };
  meta?: {
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
    utc_offset_seconds: number | null;
  };
};

const CityDetails: React.FC = () => {
  const { cityName } = useParams<{ cityName: string }>();
  const [search] = useSearchParams();
  const latStr = search.get("latitude") || undefined;
  const lonStr = search.get("longitude") || undefined;
  const latitude = latStr ? parseFloat(latStr) : undefined;
  const longitude = lonStr ? parseFloat(lonStr) : undefined;

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const tt = useCallback((key: string) => t(key), [t]);

  const { weatherQuery } = useWeatherData({ latitude, longitude });
  const { data, isLoading, error } = weatherQuery;

  useEffect(() => {
    if (!cityName) navigate("/");
  }, [cityName, navigate]);

  const withOffset = (isoLocal?: string, offsetSec?: number | null) => {
    if (!isoLocal) return undefined;
    const sec = Number(offsetSec);
    if (!Number.isFinite(sec)) return isoLocal;
    const sign = sec >= 0 ? "+" : "-";
    const abs = Math.abs(sec);
    const hh = String(Math.floor(abs / 3600)).padStart(2, "0");
    const mm = String(Math.floor((abs % 3600) / 60)).padStart(2, "0");
    return `${isoLocal}${sign}${hh}:${mm}`;
  };

  const fmtDateOnly = (
    iso?: string,
    opts?: Intl.DateTimeFormatOptions,
    tz?: string | null
  ) =>
    iso
      ? new Date(iso).toLocaleDateString(i18n.language, {
          timeZone: tz || undefined,
          ...opts,
        })
      : "-";

  const fmtDateTime = (
    isoLocal?: string,
    tz?: string | null,
    offsetSec?: number | null,
    opts?: Intl.DateTimeFormatOptions
  ) => {
    const isoWithZone = withOffset(isoLocal, offsetSec);
    return isoWithZone
      ? new Date(isoWithZone).toLocaleString(i18n.language, {
          timeZone: tz || undefined,
          ...opts,
        })
      : "-";
  };

  const vm = useMemo<MappedWeather | null>(() => {
    if (!data) return null;
    return mapOpenMeteoToCard(data as any, tt) as MappedWeather;
  }, [data, tt]);

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <>
        <DetailCardSkeleton
          className={styles.currentCard}
          mainClassName={styles.currentMain}
          statsClassName={styles.currentStats}
          statClassName={styles.stat}
          tempNowClassName={styles.tempNow}
          metaClassName={styles.meta}
        />
        <DailyTableSkeleton
          sectionClassName={styles.dailySection}
          tableClassName={styles.table}
        />
      </>
    );
  } else if (error) {
    body = <div>{t("errors.fetch_error", "Veri alınamadı")}</div>;
  } else if (!data || !vm) {
    body = <div>{t("errors.city_not_found", "Şehir bulunamadı")}</div>;
  } else {
    const dailyUnits = vm?.units?.daily ?? vm.daily_units ?? {};
    const currentUnits = vm?.units?.current ?? vm.current_weather_units ?? {};

    const tz =
      (data as any)?.timezone ??
      vm?.meta?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone;

    const offsetSec =
      (data as any)?.utc_offset_seconds ?? vm?.meta?.utc_offset_seconds ?? 0;

    const currentTimeIso =
      (data as any)?.current_weather?.time ?? (data as any)?.current?.time;

    const nowText = fmtDateTime(currentTimeIso, tz, offsetSec, {
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    const rows: MappedRow[] =
      vm.forecast.rows ??
      vm.forecast.time.map((d, i) => ({
        date: d,
        min: vm.forecast.temperature_2m_min?.[i] ?? null,
        max: vm.forecast.temperature_2m_max?.[i] ?? null,
        precipitation: vm.forecast.precipitation_sum?.[i] ?? null,
        humidityAvg: vm.forecast.humidity_avg_by_date?.[d] ?? null,
      }));

    body = (
      <>
        <section className={styles.currentCard}>
          <div className={styles.currentMain}>
            <div className={styles.tempNow}>
              <span className={styles.emoji}>{vm.icon}</span>
              <span className={styles.tempValue}>
                {Number.isFinite(vm.temperature) ? vm.temperature : "-"}
                <small className={styles.unitSmall}>
                  {currentUnits.temperature || "°C"}
                </small>
              </span>
            </div>
            <div className={styles.meta}>
              <strong>{vm.description}</strong>
              <div className={styles.time}>{nowText}</div>
            </div>
          </div>

          <div className={styles.currentStats}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>
                {t("weather.wind", "Rüzgar")}
              </span>
              <span className={styles.statValue}>
                {Number.isFinite(vm.windSpeed) ? vm.windSpeed : "-"}{" "}
                <small>{currentUnits.windspeed || "km/h"}</small>{" "}
                <em className={styles.dim}>({vm.windDirectionText})</em>
              </span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>
                {t("weather.humidity", "Nem")}
              </span>
              <span className={styles.statValue}>
                {Number.isFinite(vm.humidity) ? `${vm.humidity}%` : "-"}
              </span>
            </div>
          </div>
        </section>

        <section className={styles.dailySection}>
          <h2>{t("weather.daily_forecast", "Günlük Tahmin")}</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("weather.date", "Tarih")}</th>
                <th>{t("weather.min_temp", "Min Sıcaklık")}</th>
                <th>{t("weather.max_temp", "Maks Sıcaklık")}</th>
                <th>{t("weather.precipitation", "Yağış")}</th>
                <th>{t("weather.humidity_avg", "Ortalama Nem (%)")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.date}-${i}`}>
                  <td>
                    {fmtDateOnly(
                      r.date,
                      { weekday: "short", day: "2-digit", month: "2-digit" },
                      tz
                    )}
                  </td>
                  <td>
                    {r.min != null ? r.min.toFixed(1) : "-"}
                    <small className={styles.unitSmall}>
                      {dailyUnits.temperature_2m_min || "°C"}
                    </small>
                  </td>
                  <td>
                    {r.max != null ? r.max.toFixed(1) : "-"}
                    <small className={styles.unitSmall}>
                      {dailyUnits.temperature_2m_max || "°C"}
                    </small>
                  </td>
                  <td>
                    {r.precipitation != null ? r.precipitation.toFixed(1) : "-"}
                    <small className={styles.unitSmall}>
                      {dailyUnits.precipitation_sum || "mm"}
                    </small>
                  </td>
                  <td>{r.humidityAvg != null ? `${r.humidityAvg}%` : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </>
    );
  }

  return (
    <div className={styles.cityDetails}>
      <h1>
        {cityName}
        {Number.isFinite(latitude) && Number.isFinite(longitude) ? (
          <span className="coords">
            {" "}
            <small>
              ({latitude?.toFixed(2)}, {longitude?.toFixed(2)})
            </small>
          </span>
        ) : null}
      </h1>
      {body}
    </div>
  );
};

export default CityDetails;
