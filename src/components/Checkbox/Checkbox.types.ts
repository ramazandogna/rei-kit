export type CheckboxSize = "sm" | "md" | "lg";
export type CheckboxRounded = "none" | "md" | "lg" | "full";
export type CheckboxColor =
  | "primary"
  | "secondary"
  | "accent"
  | "destructive"
  | "muted";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  size?: CheckboxSize;
  rounded?: CheckboxRounded;
  color?: CheckboxColor;
  className?: string;
  errorMessage?: string;
}
