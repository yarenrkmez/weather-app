import React from "react";
import { useTheme } from "contexts/ThemeContext";
import styles from "./ThemeToggleButton.module.scss";

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggleButton}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? "🌞" : "🌙"}
    </button>
  );
};

export default ThemeToggleButton;
