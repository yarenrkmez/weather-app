import React from "react";
import Skeleton from "components/atoms/Skeleton/Skeleton";
import styles from "./CityWeatherCardSkeleton.module.scss";

type Props = {
  ariaLabel?: string;
  showActions?: boolean;
  showFooter?: boolean;
};

const CityWeatherCardSkeleton: React.FC<Props> = ({
  ariaLabel = "Loading city card",
  showActions = true,
  showFooter = true,
}) => {
  return (
    <article className={styles.card} aria-busy="true" aria-label={ariaLabel}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          <Skeleton width={180} height={22} />
        </h2>
        {showActions && (
          <div className={styles.actions}>
            <Skeleton
              width={28}
              height={28}
              circle
              aria-label="loading refresh"
            />
            <Skeleton
              width={28}
              height={28}
              circle
              aria-label="loading remove"
            />
          </div>
        )}
      </header>

      <section className={styles.body}>
        <div className={styles.tempRow}>
          <Skeleton width={120} height={56} />
        </div>

        <div className={styles.descRow}>
          <Skeleton width={28} height={28} circle />
          <Skeleton width={150} height={16} />
        </div>

        <div className={styles.rangeRow}>
          <Skeleton width={140} height={14} />
        </div>

        <div className={styles.statsRow}>
          <Skeleton width={170} height={16} />
          <Skeleton width={180} height={16} />
        </div>
      </section>

      {showFooter && (
        <footer className={styles.footer}>
          <Skeleton width={180} height={12} />
        </footer>
      )}
    </article>
  );
};

export default CityWeatherCardSkeleton;
