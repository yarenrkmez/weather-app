import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.scss";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className={styles.languageSwitcher}>
      <button
        onClick={() => changeLanguage("en")}
        disabled={i18n.language === "en"}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("tr")}
        disabled={i18n.language === "tr"}
        aria-label="Türkçe'ye geç"
      >
        TR
      </button>
      <button
        onClick={() => changeLanguage("es")}
        disabled={i18n.language === "es"}
        aria-label="Cambiar a Español"
      >
        ES
      </button>
    </div>
  );
};

export default LanguageSwitcher;
