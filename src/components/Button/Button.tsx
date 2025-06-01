import React from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import { VARIANTS, SIZES, ROUNDED } from "./Button.constants";
import type { ButtonProps } from "./Button.types";

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  styleType = "filled",
  size = "md",
  rounded = "md",
  href,
  loading,
  loadingText = "Loading...",
  className,
  disabled,
  ...rest
}) => {
  const CLASSNAME = cn(
    "inline-flex items-center justify-center transition-colors duration-200 ease-in-out focus:outline-none gap-1.5",
    SIZES[size],
    VARIANTS[variant][styleType],
    ROUNDED[rounded],
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  if (href) {
    return (
      <Link
        to={disabled || loading ? "#" : href}
        className={CLASSNAME}
        onClick={disabled || loading ? (e) => e.preventDefault() : rest.onClick}
        {...rest}
      >
        {loading ? loadingText : children}
      </Link>
    );
  }

  return (
    <button disabled={disabled || loading} className={CLASSNAME} {...rest}>
      {loading ? loadingText : children}
    </button>
  );
};

export default Button;
