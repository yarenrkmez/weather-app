import React from "react";
import styles from "./Skeleton.module.scss";

type Props = {
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  rounded?: number | string;
  className?: string;
  style?: React.CSSProperties;
  inline?: boolean;
  "aria-label"?: string;
};

const Skeleton: React.FC<Props> = ({
  width = "100%",
  height = 16,
  circle = false,
  rounded = 8,
  className,
  style,
  inline = false,
  ...rest
}) => {
  const s: React.CSSProperties = {
    width,
    height,
    borderRadius: circle ? 9999 : rounded,
    display: inline ? "inline-block" : "block",
    ...style,
  };
  return (
    <span
      role="status"
      aria-busy="true"
      className={`${styles.skeleton} ${className || ""}`}
      style={s}
      {...rest}
    />
  );
};

export default Skeleton;
