import React from "react";
import { Icon } from "@iconify/react";
import cn from "classnames";
import { SIZES, ROUNDED, COLORS } from "./Checkbox.constants";
import type { CheckboxProps } from "./Checkbox.types";

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  size = "md",
  rounded = "md",
  color = "primary",
  className,
  checked,
  onChange,
  disabled = false,
  errorMessage,
  ...rest
}) => {
  const checkboxClasses = cn(
    "relative flex items-center justify-center border transition-all duration-200",
    SIZES[size],
    ROUNDED[rounded],
    COLORS[color],
    {
      "bg-current text-white": checked && !disabled,
      "bg-gray-200 text-gray-400": disabled,
      "bg-transparent": !checked,
      "opacity-50 cursor-not-allowed": disabled,
    },
    className
  );

  const iconClass = cn(
    "absolute pointer-events-none transition-opacity duration-150",
    "w-[65%] h-[65%]",
    {
      "opacity-100": checked,
      "opacity-0": !checked,
      "text-white": !disabled,
      "text-gray-400": disabled,
    }
  );

  return (
    <div className="space-y-1">
      <label
        className={cn("inline-flex items-center gap-2 select-none", {
          "cursor-not-allowed": disabled,
          "cursor-pointer": !disabled,
        })}
      >
        <span className={checkboxClasses}>
          <Icon icon="line-md:check-all" className={iconClass} />
          <input
            type="checkbox"
            className={cn(
              "absolute inset-0 opacity-0",
              disabled ? "cursor-not-allowed" : "cursor-pointer"
            )}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            {...rest}
          />
        </span>
        {label && (
          <span
            className={cn("text-sm", {
              "text-gray-400": disabled,
            })}
          >
            {label}
          </span>
        )}
      </label>
      {errorMessage && !disabled && (
        <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
          <Icon icon="material-symbols:error" className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Checkbox;
