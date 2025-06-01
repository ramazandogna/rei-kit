export const SIZES: { [key in "sm" | "md" | "lg"]: string } = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export const ROUNDED: { [key in "none" | "md" | "lg" | "full"]: string } = {
  none: "rounded-none",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};

export const COLORS: {
  [key in "primary" | "secondary" | "accent" | "destructive" | "muted"]: string;
} = {
  primary:
    "text-primary border-primary checked:bg-primary checked:border-primary",
  secondary:
    "text-secondary border-secondary checked:bg-secondary checked:border-secondary",
  accent: "text-accent border-accent checked:bg-accent checked:border-accent",
  destructive:
    "text-destructive border-destructive checked:bg-destructive checked:border-destructive",
  muted: "text-muted border-muted checked:bg-muted checked:border-muted",
};
