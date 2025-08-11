import React from "react";
import styles from "./AddCityForm.module.scss";
import type { CitySuggestion } from "./types";

type Props = {
  s: CitySuggestion;
  onSelect: (name: string) => void;
};

const SuggestionItem: React.FC<Props> = ({ s, onSelect }) => {
  const countryLabel = s.country
    ? `, ${s.country}`
    : s.country_code
    ? `, ${s.country_code.toUpperCase()}`
    : "";
  const adminLabel = s.admin1 ? `, ${s.admin1}` : "";

  return (
    <li
      key={`${s.latitude}-${s.longitude}`}
      onClick={() => onSelect(s.name)}
      role="option"
      tabIndex={0}
      className={styles["suggestion-item"]}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(s.name);
        }
      }}
      aria-selected="false"
    >
      {s.name}
      {adminLabel}
      {countryLabel}
    </li>
  );
};

export default SuggestionItem;
