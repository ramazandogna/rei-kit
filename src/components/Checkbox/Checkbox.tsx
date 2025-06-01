import React from "react";
import cn from "classnames";
import { SIZES, ROUNDED, COLORS } from "./Checkbox.constants";
import type { CheckboxProps } from "./Checkbox.types";

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  size = "md",
  rounded = "md",
  color = "primary",
  className,
  ...rest
}) => {
  const checkboxClasses = cn(
    "appearance-none cursor-pointer transition-all duration-200 focus:outline-none focus:ring focus:ring-offset-2 focus:ring-color-ring",
    "checked:icon-[line-md:bell-alert-filled-loop]",
    SIZES[size],
    ROUNDED[rounded],
    COLORS[color],
    className
  );

  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <input type="checkbox" className={checkboxClasses} {...rest} />
      {label && <span>{label}</span>}
    </label>
  );
};

export default Checkbox;
