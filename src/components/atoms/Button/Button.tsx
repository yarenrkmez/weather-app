import React from "react";
import styles from "./Button.module.scss";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary";
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
};

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  fullWidth = false,
  children,
  className,
  ...props
}) => {
  const classNames = [
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    fullWidth ? styles["button--fullWidth"] : "",
    className || "",
  ].join(" ");

  return (
    <button className={classNames} {...props}>
      {children}
    </button>
  );
};

export default Button;
