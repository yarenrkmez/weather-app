import React from "react";
import Skeleton from "components/atoms/Skeleton/Skeleton";

type Props = {
  className?: string;
  mainClassName?: string;
  statsClassName?: string;
  statClassName?: string;
  tempNowClassName?: string;
  metaClassName?: string;
  emojiSize?: number;
};

const DetailCardSkeleton: React.FC<Props> = ({
  className,
  mainClassName,
  statsClassName,
  statClassName,
  tempNowClassName,
  metaClassName,
  emojiSize = 36,
}) => {
  return (
    <section className={className}>
      <div
        className={mainClassName}
        style={{ alignItems: "center", gap: "1rem", display: "flex" }}
      >
        <div
          className={tempNowClassName}
          style={{ display: "flex", alignItems: "center", gap: ".5rem" }}
        >
          <Skeleton
            width={emojiSize}
            height={emojiSize}
            circle
            aria-label="loading weather icon"
          />
          <Skeleton
            width={120}
            height={32}
            rounded={10}
            aria-label="loading temperature"
          />
        </div>
        <div
          className={metaClassName}
          style={{ display: "grid", gap: ".25rem" }}
        >
          <Skeleton width={140} height={18} />
          <Skeleton width={180} height={14} />
        </div>
      </div>

      <div
        className={statsClassName}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: ".75rem",
          marginTop: ".75rem",
        }}
      >
        {[0, 1].map((i) => (
          <div
            key={i}
            className={statClassName}
            style={{ display: "grid", gap: ".25rem" }}
          >
            <Skeleton width={80} height={12} />
            <Skeleton width={120} height={18} style={{ marginTop: 6 }} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default DetailCardSkeleton;
