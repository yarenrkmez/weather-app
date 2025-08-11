import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  KeyboardEvent,
  FormEvent,
} from "react";
import styles from "./AddCityForm.module.scss";
import { useTranslation } from "react-i18next";
import { useCityWeather } from "contexts/CityWeatherContext";
import { useCitySuggestions } from "features/dashboard/hooks/useCitySuggestions";
import Button from "components/atoms/Button/Button";

type Suggestion = {
  id?: number;
  name: string;
  country?: string;
  admin1?: string;
  country_code?: string;
  latitude: number;
  longitude: number;
};

const DEBOUNCE_MS = 300;

const AddCityForm: React.FC = () => {
  const { t, i18n } = useTranslation();
  const language = useMemo(
    () => i18n.language?.split("-")[0] ?? "tr",
    [i18n.language]
  );

  const { addCity } = useCityWeather();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  const {
    data: suggestions = [],
    isLoading: isLoadingSuggestions,
    isFetching: isFetchingSuggestions,
    isError: isSuggestionsError,
  } = useCitySuggestions(debouncedQuery, { limit: 100, language });

  useEffect(() => {
    if (debouncedQuery && suggestions.length > 0) setShowSuggestions(true);
    else setShowSuggestions(false);
    setActiveIndex(-1);
  }, [debouncedQuery, suggestions.length]);

  const resetUI = () => {
    setQuery("");
    setShowSuggestions(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const chosen =
      activeIndex >= 0 && activeIndex < suggestions.length
        ? (suggestions[activeIndex] as Suggestion)
        : undefined;

    if (chosen) {
      addCity({
        city: chosen.name,
        latitude: chosen.latitude,
        longitude: chosen.longitude,
      });
      resetUI();
      return;
    }

    addCity({ city: query.trim() });
    resetUI();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handlePick = (s: Suggestion) => {
    addCity({ city: s.name, latitude: s.latitude, longitude: s.longitude });
    resetUI();
  };

  return (
    <form
      className={styles["add-city-form"]}
      onSubmit={handleSubmit}
      autoComplete="off"
    >
      <div className="input-wrapper" style={{ position: "relative", flex: 1 }}>
        <input
          ref={inputRef}
          className={styles["add-city-form__input"]}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t(
            "placeholders.enter_city_name",
            "Şehir ara (ör. Istanbul)"
          )}
          aria-autocomplete="list"
          aria-controls="city-suggestions"
          aria-activedescendant={
            activeIndex >= 0 ? `city-option-${activeIndex}` : undefined
          }
        />

        {showSuggestions && (
          <ul
            id="city-suggestions"
            role="listbox"
            className={styles["add-city-form__suggestions"]}
          >
            {isLoadingSuggestions || isFetchingSuggestions ? (
              <li className={styles["add-city-form__suggestions-item"]}>
                {t("loading", "Yükleniyor...")}
              </li>
            ) : isSuggestionsError ? (
              <li className={styles["add-city-form__suggestions-item"]}>
                {t("error_loading", "Öneriler yüklenemedi")}
              </li>
            ) : suggestions.length === 0 ? (
              <li className={styles["add-city-form__suggestions-item"]}>
                {t("no_results", "Sonuç yok")}
              </li>
            ) : (
              suggestions.map((s: any, idx: number) => {
                const labelParts = [
                  s.name,
                  s.admin1 && `(${s.admin1})`,
                  s.country && `– ${s.country}`,
                ].filter(Boolean);
                const label = labelParts.join(" ");
                const isActive = idx === activeIndex;
                return (
                  <li
                    id={`city-option-${idx}`}
                    key={`${s.id ?? `${s.name}-${idx}`}`}
                    role="option"
                    aria-selected={isActive}
                    className={`${styles["add-city-form__suggestions-item"]} ${
                      isActive
                        ? styles["add-city-form__suggestions-item--active"]
                        : ""
                    }`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePick(s)}
                  >
                    {label}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
      <Button
        className={styles["add-city-form__submit"]}
        aria-label={t("add_city", "Şehir ekle")}
      >
        {t("buttons.add", "Ekle")}
      </Button>
    </form>
  );
};

export default AddCityForm;
