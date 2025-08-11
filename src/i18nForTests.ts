import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  resources: {
    en: {
      translation: {
        buttons: {
          toggle_details: "Toggle details",
          refresh: "Refresh",
          remove: "Remove",
        },
        weather: {
          humidity: "Humidity",
          wind: "Wind",
          daily_forecast: "Daily Forecast",
          date: "Date",
          min_temp: "Min Temp",
          max_temp: "Max Temp",
          precipitation: "Precipitation",
        },
      },
    },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
