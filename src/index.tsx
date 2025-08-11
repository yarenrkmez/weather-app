import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CityWeatherProvider } from "contexts/CityWeatherContext";
import { ThemeProvider } from "contexts/ThemeContext";
import "./i18n";
import "./styles/global.scss";

const queryClient = new QueryClient();

function computeBasename(pub?: string): string {
  const raw = pub || "/";
  try {
    const u = new URL(raw, window.location.origin);
    let p = u.pathname || "/";
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p || "/";
  } catch {
    let p = raw.startsWith("/") ? raw : "/";
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p || "/";
  }
}

const basename = computeBasename(process.env.PUBLIC_URL);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <CityWeatherProvider>
            <App />
          </CityWeatherProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
