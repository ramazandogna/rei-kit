export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
  children: React.ReactNode;
  variant?: ButtonVariantType;
  styleType?: ButtonStyleType;
  size?: ButtonSizeType;
  rounded?: ButtonRoundedType;
  href?: string;
  className?: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
}

export type ButtonStyleType = "filled" | "stroke" | "ghost";
export type ButtonVariantType =
  | "primary"
  | "secondary"
  | "accent"
  | "destructive"
  | "muted";
export type ButtonSizeType = "xs" | "md" | "lg";
export type ButtonRoundedType = "none" | "md" | "lg" | "full";
