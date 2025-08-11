import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeToggleButton from "components/atoms/ThemeToggleButton/ThemeToggleButton";
import LanguageSwitcher from "components/atoms/LanguageSwitcher/LanguageSwitcher";
import styles from "./Header.module.scss";

type HeaderProps = {
  showBack?: boolean;
};

const Header: React.FC<HeaderProps> = ({ showBack }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const canGoBack = useMemo(() => {
    if (typeof window === "undefined") return false;
    if (typeof showBack === "boolean") return showBack;
    const isRoot = location.pathname === "/";
    return window.history.length > 1 && !isRoot;
  }, [location.pathname, showBack]);

  const handleBack = () => {
    try {
      if (typeof window !== "undefined" && window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/");
      }
    } catch {
      navigate("/");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {canGoBack && (
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBack}
            aria-label={t("buttons.back")}
          >
            ← {t("buttons.back")}
          </button>
        )}
      </div>

      <div className={styles.right}>
        <LanguageSwitcher />
        <ThemeToggleButton />
      </div>
    </header>
  );
};

export default Header;
