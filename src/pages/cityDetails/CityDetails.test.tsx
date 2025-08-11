/* eslint-disable import/first */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18nForTests";
import CityDetails from "./CityDetails";

jest.mock("react-router-dom", () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("features/dashboard/hooks/useWeatherData", () => ({
  useWeatherData: jest.fn(),
}));

jest.mock("utils/weatherMapper", () => ({
  mapOpenMeteoToCard: jest.fn(),
}));

jest.mock(
  "components/molecules/skeletons/DailyTableSkeleton",
  () =>
    ({ sectionClassName, tableClassName }: any) =>
      (
        <div
          data-testid="daily-table-skeleton"
          data-section={sectionClassName}
          data-table={tableClassName}
        />
      )
);

jest.mock(
  "components/molecules/skeletons/DetailCardSkeleton",
  () =>
    ({
      className,
      mainClassName,
      statsClassName,
      statClassName,
      tempNowClassName,
      metaClassName,
    }: any) =>
      (
        <div
          data-testid="detail-card-skeleton"
          data-card={className}
          data-main={mainClassName}
          data-stats={statsClassName}
          data-stat={statClassName}
          data-tempnow={tempNowClassName}
          data-meta={metaClassName}
        />
      )
);

const { useParams, useNavigate, useSearchParams } =
  jest.requireMock("react-router-dom");
const { useWeatherData } = jest.requireMock(
  "features/dashboard/hooks/useWeatherData"
);
const { mapOpenMeteoToCard } = jest.requireMock("utils/weatherMapper");

const renderWithI18n = (ui: React.ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

beforeEach(() => {
  jest.clearAllMocks();
  (useParams as jest.Mock).mockReturnValue({ cityName: "Istanbul" });
  (useNavigate as jest.Mock).mockReturnValue(jest.fn());
  (useSearchParams as jest.Mock).mockReturnValue([
    new URLSearchParams("latitude=41.0&longitude=29.0"),
    jest.fn(),
  ]);
});

function expectTextOneOf(candidates: (string | RegExp)[]) {
  const found = candidates.some((c) =>
    typeof c === "string" ? !!screen.queryByText(c) : !!screen.queryByText(c)
  );
  expect(found).toBe(true);
}

test("redirects to '/' when cityName param is missing", async () => {
  const nav = jest.fn();
  (useParams as jest.Mock).mockReturnValue({});
  (useNavigate as jest.Mock).mockReturnValue(nav);
  (useWeatherData as jest.Mock).mockReturnValue({
    weatherQuery: { data: undefined, isLoading: false, error: null },
  });

  renderWithI18n(<CityDetails />);

  await waitFor(() => {
    expect(nav).toHaveBeenCalledWith("/");
  });
});

test("shows skeletons while loading", () => {
  (useWeatherData as jest.Mock).mockReturnValue({
    weatherQuery: { data: undefined, isLoading: true, error: null },
  });

  renderWithI18n(<CityDetails />);

  expect(screen.getByTestId("detail-card-skeleton")).toBeInTheDocument();
  expect(screen.getByTestId("daily-table-skeleton")).toBeInTheDocument();
});

test("shows fetch error when query has error", () => {
  (useWeatherData as jest.Mock).mockReturnValue({
    weatherQuery: {
      data: undefined,
      isLoading: false,
      error: new Error("boom"),
    },
  });

  renderWithI18n(<CityDetails />);

  expectTextOneOf([
    new RegExp(String(i18n.t("errors.fetch_error")), "i"),
    /veri alınamadı/i,
    /yüklenemedi|error|hata/i,
  ]);
});

test("shows city_not_found when no data and not loading", () => {
  (useWeatherData as jest.Mock).mockReturnValue({
    weatherQuery: { data: null, isLoading: false, error: null },
  });

  renderWithI18n(<CityDetails />);

  expectTextOneOf([
    new RegExp(String(i18n.t("errors.city_not_found")), "i"),
    /şehir bulunamadı/i,
  ]);
});

test("renders mapped weather details and daily table on success", () => {
  const rawData = {
    current_weather: { time: "2025-08-11T16:30:00" },
    utc_offset_seconds: 10800,
  };

  (mapOpenMeteoToCard as jest.Mock).mockReturnValue({
    temperature: 26,
    description: "Clear",
    descriptionKey: "weather.clear",
    icon: "☀️",
    humidity: 50,
    windSpeed: 10,
    windDirectionDeg: 45,
    windDirectionText: "NE",
    isDay: true,
    code: 0,
    forecast: {
      time: ["2025-08-11", "2025-08-12"],
      temperature_2m_max: [30, 31],
      temperature_2m_min: [22, 23],
      precipitation_sum: [0.4, 0.0],
      humidity_avg_by_date: { "2025-08-11": 48, "2025-08-12": 52 },
      rows: [
        {
          date: "2025-08-11",
          min: 22,
          max: 30,
          precipitation: 0.4,
          humidityAvg: 48,
        },
        {
          date: "2025-08-12",
          min: 23,
          max: 31,
          precipitation: 0.0,
          humidityAvg: 52,
        },
      ],
    },
    current_weather_units: { temperature: "°C", windspeed: "km/h" },
    daily_units: {
      temperature_2m_min: "°C",
      temperature_2m_max: "°C",
      precipitation_sum: "mm",
    },
    units: {
      current: { temperature: "°C", windspeed: "km/h" },
      daily: {
        temperature_2m_min: "°C",
        temperature_2m_max: "°C",
        precipitation_sum: "mm",
      },
    },
    meta: {
      latitude: 41.0,
      longitude: 29.0,
      timezone: "Europe/Istanbul",
      utc_offset_seconds: 10800,
    },
  });

  (useWeatherData as jest.Mock).mockReturnValue({
    weatherQuery: { data: rawData, isLoading: false, error: null },
  });

  renderWithI18n(<CityDetails />);

  expect(
    screen.getByRole("heading", { level: 1, name: /istanbul/i })
  ).toBeInTheDocument();

  expect(screen.getByText("26")).toBeInTheDocument();
  expect(screen.getAllByText("°C")[0]).toBeInTheDocument();

  expectTextOneOf([new RegExp(String(i18n.t("weather.wind")), "i"), /rüzgar/i]);
  expect(screen.getByText(/\(NE\)/)).toBeInTheDocument();

  expectTextOneOf([
    new RegExp(String(i18n.t("weather.humidity")), "i"),
    /nem/i,
  ]);
  expect(screen.getByText(/50%/)).toBeInTheDocument();

  expectTextOneOf([
    new RegExp(String(i18n.t("weather.daily_forecast")), "i"),
    /günlük tahmin/i,
  ]);

  expectTextOneOf([new RegExp(String(i18n.t("weather.date")), "i"), /tarih/i]);
  expectTextOneOf([
    new RegExp(String(i18n.t("weather.min_temp")), "i"),
    /min/i,
  ]);
  expectTextOneOf([
    new RegExp(String(i18n.t("weather.max_temp")), "i"),
    /maks|max/i,
  ]);
  expectTextOneOf([
    new RegExp(String(i18n.t("weather.precipitation")), "i"),
    /yağış|precipitation/i,
  ]);

  const humAvgKey = String(i18n.t("weather.humidity_avg"));
  expectTextOneOf([
    new RegExp(humAvgKey.replace(/\./g, "\\."), "i"),
    /ortalama nem/i,
    /humidity avg/i,
  ]);

  const rows = screen.getAllByRole("row");
  expect(rows.length).toBe(3);
});
