import React, { KeyboardEvent } from "react";
import styles from "./CityWeatherCard.module.scss";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

type Forecast = {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
};

type CurrentWeatherUnits = {
  time: string;
  interval: string;
  temperature: string;
  windspeed: string;
  winddirection: string;
  is_day: string;
  weathercode: string;
};

type CityWeatherCardProps = {
  city: string;
  temperature: number;
  description: string;
  icon?: string;
  humidity: number;
  windSpeed: number;
  forecast?: Forecast;
  currentWeatherUnits?: CurrentWeatherUnits;
  latitude?: number;
  longitude?: number;
  onRemove: () => void;
  onRefresh: () => void;
};

const CityWeatherCard: React.FC<CityWeatherCardProps> = ({
  city,
  temperature,
  description,
  icon,
  humidity,
  windSpeed,
  forecast,
  currentWeatherUnits,
  latitude,
  longitude,
  onRemove,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const formattedTemp = Math.round(temperature);
  const todayIndex = 0;
  const todayMax = forecast?.temperature_2m_max?.[todayIndex];
  const todayMin = forecast?.temperature_2m_min?.[todayIndex];

  const goToDetails = () => {
    navigate(
      `/city-details/${encodeURIComponent(
        city
      )}?latitude=${latitude}&longitude=${longitude}`
    );
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLHeadingElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToDetails();
    }
  };

  return (
    <article
      className={styles["city-card"]}
      aria-label={t("aria.city_card", { city })}
      onClick={goToDetails}
    >
      <header className={styles["city-card__header"]}>
        <h2
          className={styles["city-card__title"]}
          style={{ cursor: "pointer" }}
          title={t("buttons.view_details")}
          role="link"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-describedby={`details-link-${city}`}
        >
          {city}
        </h2>
        <div className={styles["city-card__actions"]}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            title={t("buttons.refresh")}
            aria-label={t("buttons.refresh")}
            type="button"
          >
            🔁
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title={t("buttons.remove")}
            aria-label={t("buttons.remove")}
            type="button"
          >
            🗑️
          </button>
        </div>
      </header>

      <section className={styles["city-card__body"]}>
        <div className={styles["city-card__temp"]}>
          {formattedTemp}
          {currentWeatherUnits?.temperature}
        </div>
        <>
          <div className={styles["city-card__desc"]}>
            {icon ? (
              <span className={styles["city-card__icon"]}>{icon}</span>
            ) : (
              <div
                className={styles["city-card__icon"]}
                aria-label={description || t("weather.unknown")}
              >
                {description || "🌈"}
              </div>
            )}
            {description}
          </div>
          {typeof todayMax === "number" && typeof todayMin === "number" && (
            <small aria-label={t("weather.today_temp_range")}>
              ({todayMin.toFixed(1)} - {todayMax.toFixed(1)}°C)
            </small>
          )}
        </>
        <div className={styles["city-card__description"]}>
          <div className={styles["city-card__details"]}>
            <div>
              💧 {t("weather.humidity")}: {humidity}%
            </div>
            <div>
              💨 {t("weather.wind")}: {windSpeed}{" "}
              {currentWeatherUnits?.windspeed}
            </div>
          </div>
        </div>
      </section>

      <footer className={styles["city-card__footer"]}>
        <small>{new Date().toLocaleString()}</small>
      </footer>
    </article>
  );
};

export default CityWeatherCard;
