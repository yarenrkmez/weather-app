import React from "react";
import Skeleton from "components/atoms/Skeleton/Skeleton";

type Props = {
  sectionClassName?: string;
  tableClassName?: string;
  titleWidth?: number;
  columns?: number;
  rows?: number;
};

const DailyTableSkeleton: React.FC<Props> = ({
  sectionClassName,
  tableClassName,
  titleWidth = 180,
  columns = 5,
  rows = 7,
}) => {
  return (
    <section className={sectionClassName}>
      <h2>
        <Skeleton width={titleWidth} height={20} inline />
      </h2>
      <div style={{ overflowX: "auto" }}>
        <table className={tableClassName}>
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i}>
                  <Skeleton width={90} height={14} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: columns }).map((__, c) => (
                  <td key={c}>
                    <Skeleton width={c === 0 ? 110 : 70} height={16} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DailyTableSkeleton;
