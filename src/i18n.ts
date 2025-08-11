import i18n from "i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

const base = (process.env.PUBLIC_URL || "").replace(/\/$/, "");

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "tr", "es"],
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    debug: false,
    interpolation: { escapeValue: false },
    backend: {
      loadPath: `${base}/locales/{{lng}}.json`,
    },
    detection: {
      order: ["querystring", "localStorage", "navigator"],
      caches: ["localStorage"],
    },
    react: { useSuspense: false },
  });

export default i18n;
