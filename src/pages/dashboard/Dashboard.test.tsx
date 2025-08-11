/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/prefer-presence-queries */
/* eslint-disable jest/no-conditional-expect */
/* eslint-disable testing-library/no-node-access */
/* eslint-disable import/first */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "../../i18nForTests";
import Dashboard from "./Dashboard";

jest.mock("contexts/CityWeatherContext", () => ({
  useCityWeather: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueries: jest.fn(),
}));

jest.mock("features/addCity/AddCityForm", () => () => (
  <div data-testid="add-city-form" />
));

jest.mock(
  "components/molecules/skeletons/CityWeatherCardSkeleton",
  () => () => <div data-testid="city-card-skeleton" />
);

jest.mock(
  "../../features/dashboard/components/CityWeatherCard/CityWeatherCard",
  () => (props: any) =>
    (
      <div data-testid="city-card">
        <span data-testid="city-card-name">{props.city}</span>
        <button onClick={props.onRemove}>remove</button>
        <button onClick={props.onRefresh}>refresh</button>
      </div>
    )
);

const { useCityWeather } = jest.requireMock("contexts/CityWeatherContext");
const { useQueries } = jest.requireMock("@tanstack/react-query");

const renderWithI18n = (ui: React.ReactElement) =>
  render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

const t = (key: string) => i18n.t(key);

beforeEach(() => {
  jest.clearAllMocks();
});

test("shows 'no city added' message when cities list is empty", () => {
  useCityWeather.mockReturnValue({
    cities: [],
    removeCity: jest.fn(),
    updateCity: jest.fn(),
  });

  useQueries.mockReturnValue([]);

  const { container } = renderWithI18n(<Dashboard />);

  const byKey = screen.queryByText(
    new RegExp(t("messages.no_city_added"), "i")
  );
  const byFallback = screen.queryByText(/şehir ekleyin|no city added/i);

  expect(byKey || byFallback).toBeInTheDocument();
  expect(screen.queryByTestId("city-card")).not.toBeInTheDocument();

  expect(screen.getByTestId("add-city-form")).toBeInTheDocument();

  const inlineSkel = container.querySelector('[class*="cardSkeleton"]');
  expect(screen.queryByTestId("city-card-skeleton") || inlineSkel).toBeFalsy();
});

test("renders skeleton while a city's weather is loading", () => {
  const mockRemove = jest.fn();
  const mockUpdate = jest.fn();

  useCityWeather.mockReturnValue({
    cities: [{ id: "1", city: "Istanbul" }],
    removeCity: mockRemove,
    updateCity: mockUpdate,
  });

  useQueries.mockReturnValue([
    {
      data: undefined,
      isLoading: true,
      isFetching: true,
      isError: false,
      isSuccess: false,
      error: null,
      refetch: jest.fn(),
    },
  ]);

  const { container } = renderWithI18n(<Dashboard />);

  const inlineSkel = container.querySelector('[class*="cardSkeleton"]');
  expect(screen.queryByTestId("city-card-skeleton") || inlineSkel).toBeTruthy();
  expect(screen.queryByTestId("city-card")).not.toBeInTheDocument();
});

test("renders error message when query returns error", () => {
  const mockRemove = jest.fn();
  const mockUpdate = jest.fn();

  useCityWeather.mockReturnValue({
    cities: [{ id: "1", city: "Istanbul" }],
    removeCity: mockRemove,
    updateCity: mockUpdate,
  });

  useQueries.mockReturnValue([
    {
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      isSuccess: false,
      error: new Error("boom"),
      refetch: jest.fn(),
    },
  ]);

  renderWithI18n(<Dashboard />);

  const expected = new RegExp(t("errors.fetch_error"), "i");
  const alt = /yüklenemedi|error|hata/i;
  expect(
    screen.queryByText(expected) || screen.queryByText(alt)
  ).toBeInTheDocument();
  expect(screen.queryByTestId("city-card")).not.toBeInTheDocument();
});

test("renders CityWeatherCard on success and wires remove/refresh (updateCity is optional)", async () => {
  const mockRemove = jest.fn();
  const mockUpdate = jest.fn();
  const mockRefetch = jest.fn();

  const currentCities = [{ id: "1", city: "Istanbul" }];

  useCityWeather.mockReturnValue({
    cities: currentCities,
    removeCity: mockRemove,
    updateCity: mockUpdate,
  });

  const data = {
    id: "1",
    city: "Istanbul",
    temperature: 25,
    description: "Clear sky",
    icon: "",
    humidity: 40,
    windSpeed: 5,
    forecast: {
      time: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
      precipitation_sum: [],
    },
    latitude: 41.0082,
    longitude: 28.9784,
    current_weather_units: { temperature: "°C", windspeed: "km/h" },
    daily_units: {},
  };

  useQueries.mockReturnValue([
    {
      data,
      isLoading: false,
      isFetching: false,
      isError: false,
      isSuccess: true,
      error: null,
      refetch: mockRefetch,
    },
  ]);

  renderWithI18n(<Dashboard />);

  expect(screen.getByTestId("city-card")).toBeInTheDocument();
  expect(screen.getByTestId("city-card-name")).toHaveTextContent("Istanbul");

  fireEvent.click(screen.getByText("remove"));
  expect(mockRemove).toHaveBeenCalled();
  const removeArg = mockRemove.mock.calls[0][0];
  expect([currentCities[0].id, currentCities[0].city]).toContain(removeArg);

  fireEvent.click(screen.getByText("refresh"));
  expect(mockRefetch).toHaveBeenCalledTimes(1);

  if (mockUpdate.mock.calls.length > 0) {
    const updateArg = mockUpdate.mock.calls[0][0];
    expect(updateArg.city).toBe("Istanbul");
  }
});
