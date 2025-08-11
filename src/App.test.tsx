/* eslint-disable testing-library/no-node-access */
/* eslint-disable import/first */
jest.mock("react-router-dom", () => {
  const React = require("react");
  const Outlet = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  const useRoutes = jest.fn(() => React.createElement("div", null));
  return { Outlet, useRoutes };
});

import React from "react";
import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18nForTests";
import { CityWeatherProvider } from "contexts/CityWeatherContext";
import { ThemeProvider } from "contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) =>
  render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CityWeatherProvider>{ui}</CityWeatherProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nextProvider>
  );

test("App mounts without crashing", () => {
  renderWithProviders(<App />);
  const appRoot = document.querySelector(".App");
  expect(appRoot).toBeTruthy();
});
