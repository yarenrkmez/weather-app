import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AddCityForm.module.scss";
import SuggestionItem from "./SuggestionItem";
import type { CitySuggestion } from "./types";
import { useInfiniteScroll } from "hooks/useInfiniteScroll";

type Props = {
  show: boolean;
  suggestions: CitySuggestion[];
  onSelect: (name: string) => void;
  loading?: boolean;
  hint?: string;
  step?: number;
};

const SuggestionsList: React.FC<Props> = ({
  show,
  suggestions,
  onSelect,
  loading = false,
  hint = "Scroll for more…",
  step = 12,
}) => {
  const listRef = useRef<HTMLUListElement | null>(null);
  const [visibleCount, setVisibleCount] = useState(step);

  useEffect(() => {
    setVisibleCount(step);
  }, [suggestions.length, step]);

  const total = suggestions.length;
  const canLoadMore = visibleCount < total;
  const visibleItems = useMemo(
    () => suggestions.slice(0, visibleCount),
    [suggestions, visibleCount]
  );

  const { setSentinelRef } = useInfiniteScroll({
    hasMore: canLoadMore,
    onLoadMore: () => setVisibleCount((c) => Math.min(c + step, total)),
    root: listRef,
    rootMargin: "0px 0px 48px 0px",
    threshold: 0,
    disabled: !show || loading || total === 0,
  });

  if (!show || total === 0) return null;

  return (
    <ul
      id="city-suggestions-list"
      className={styles["suggestions-list"]}
      role="listbox"
      aria-busy={loading}
      ref={listRef}
    >
      {visibleItems.map((s) => (
        <SuggestionItem
          key={`${s.latitude}-${s.longitude}`}
          s={s}
          onSelect={onSelect}
        />
      ))}

      {canLoadMore && (
        <li
          ref={setSentinelRef}
          aria-hidden="true"
          className={styles["suggestions-list__hint"]}
        >
          {hint}
        </li>
      )}
    </ul>
  );
};

export default SuggestionsList;
