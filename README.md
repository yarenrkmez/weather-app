# Weather App

A React + TypeScript single-page application that shows current weather and a 7-day forecast using Open-Meteo. It supports debounced city search with suggestions, TR/EN localization, dark mode, skeletons, and client-side caching via React Query.

> **TL;DR**
>
> - **Dev:** `yarn install && yarn start`
> - **Build:** `yarn build`
> - **Test:** `yarn test`
> - Add a city → see dashboard cards → go to details.
> - deploy: https://yarenrkmez.github.io/weather-app/

---

## ✨ Features

- 🔎 Debounced city search with suggestions (Open-Meteo **Geocoding**)
- 🌤️ Current weather + 7-day forecast (Open-Meteo **Forecast**)
- 💾 Persistent city list (LocalStorage via context)
- 🌐 i18n (TR/EN) with language detector
- 🌙 Dark/Light theme toggle (Sass modules)
- ♿ Accessible listbox (keyboard navigation)
- ⚡ React Query v5 caching, error states & refetch
- 🦴 Skeleton UIs for perceived performance
- 🧪 Unit tests (Jest + Testing Library)

---

## 🧱 Tech Stack

- **React** + **TypeScript**
- **React Router**
- **@tanstack/react-query** v5
- **i18next** (+ http-backend, language detector)
- **Sass modules** (scoped styles)
- **Create React App** (`react-scripts`, webpack)

---

## 📦 Project Structure

```
src/
  components/        # Atoms/Molecules/Skeletons
  constants/         # WMO codes → UI map
  contexts/          # CityWeather, Theme, Language
  features/
    addCity/         # AddCityForm + suggestions
    dashboard/       # Weather cards + hooks
  hooks/             # useLocalStorage, useInfiniteScroll
  pages/             # Dashboard, CityDetails
  services/          # open-meteo fetchers (geocoding/forecast)
  utils/             # mapping helpers (WMO → text+emoji, units, humidity)
  i18nForTests.ts    # in-memory i18n instance for tests
```

---

## 🔌 APIs

- **Geocoding**  
  `GET https://geocoding-api.open-meteo.com/v1/search?name=<city>&count=...&language=...`

- **Forecast**  
  `GET https://api.open-meteo.com/v1/forecast?latitude=<lat>&longitude=<lon>&current_weather=1&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&hourly=relative_humidity_2m&timezone=auto`

> No API keys required.

---

## 🚀 Getting Started

```bash
# 1) Install deps
yarn install   # or just: yarn

# 2) Start dev server
yarn start

# 3) Run tests (watch)
yarn test

# 4) Production build
yarn build
```

**Environment**

- Node ≥ 18 recommended
- CRA (`react-scripts`)
- TS `baseUrl=src`; path aliases under `compilerOptions.paths` (if used)

---

## 🧠 Architecture & Data Flow

```
AddCityForm
  └─ CityWeatherContext (LocalStorage)
       └─ Dashboard
            └─ React Query useQueries([...cities])
                 ├─ fetchCoordinatesByCity(name, { limit, language })
                 └─ fetchCurrentWeatherByCoords(lat, lon, { daily, hourly, timezone=auto })
                      ↳ mapWmo() / describeWeather() / pickCurrentHumidity()
       └─ CityDetails
            └─ useWeatherData({ latitude, longitude })  // raw Open-Meteo
                 ↳ mapOpenMeteoToCard()                // current | current_weather compatible
```

**Why these choices?**

- **Query key** includes language → switching locale triggers a refetch for user-visible text.
- **Timezone correctness**: always request with `timezone=auto`; display time using `toLocale*` with the API’s `timezone` and `utc_offset_seconds`.
- **Precipitation (mm)**: `daily.precipitation_sum` is included and the table header shows units.
- **Humidity now**: nearest hour picked from `hourly.relative_humidity_2m`.

---

## 🧩 Important Types (UI contract)

```ts
// contexts/CityWeatherContext.tsx (UI store shape)
export interface CityWeather {
  id: string;
  city: string;
  temperature: number;
  description: string;
  icon?: string;
  humidity: number;
  windSpeed: number;
  forecast?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
  latitude?: number;
  longitude?: number;
}
```

> Services convert `lat/lon` to `latitude/longitude` and normalize `current` vs `current_weather` for UI.

---

## 🌐 i18n & Timezone

- Open-Meteo returns local timestamps + `utc_offset_seconds` when `timezone=auto`.
- We append offset to ISO (`YYYY-MM-DDTHH:mm±HH:MM`) and format via `toLocaleString(i18n.language, { timeZone })`.
- If you see wrong day/time: verify `timezone=auto` in the request and that your formatter uses `timezone` + `utc_offset_seconds`.

---

## 🧪 Testing Notes

- Jest + Testing Library with in-memory i18n (`i18nForTests.ts`)
- Mock `react-router-dom` and **React Query** responses.
- **Tip:** React Query v5 returns flags like `isLoading/isFetching/isError/isSuccess`. When mocking `useQueries`, set them explicitly so components enter the right branch.

**CityDetails header (humidity)**

- Don’t hardcode TR copy. Prefer asserting the i18n value (or accept fallback):
  ```ts
  expect(screen.getByText(/Average Humidity|Ortalama Nem|humidity avg/i));
  ```

**Dashboard behavior**

- Some variants call `updateCity(q.data)` on success. If your app does not, keep the test tolerant (check card render & actions; assert update only if called).

Run once:

```bash
yarn test --watchAll=false
```

---

## ⚙️ React Query Defaults

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## ♿ Accessibility

- Suggestions list uses `role="listbox"`/`role="option"`.
- Manage keyboard focus (`aria-activedescendant`, `aria-selected`).
- Icon-only buttons have accessible labels.

---

## 📄 License

MIT
