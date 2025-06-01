import type {
  ButtonRoundedType,
  ButtonSizeType,
  ButtonVariantType,
} from "./Button.types";

export const VARIANTS: {
  [key in ButtonVariantType]: {
    filled: string;
    stroke: string;
    ghost: string;
  };
} = {
  primary: {
    filled:
      "text-primary-foreground bg-primary hover:opacity-90 active:opacity-95",
    stroke:
      "bg-transparent text-primary border border-primary hover:bg-primary/10 transition-colors duration-200",
    ghost:
      "bg-transparent text-primary hover:bg-primary/10 transition-colors duration-200",
  },
  secondary: {
    filled:
      "text-secondary-foreground bg-secondary hover:opacity-90 active:opacity-95",
    stroke:
      "bg-transparent text-secondary border border-secondary hover:bg-secondary/10 transition-colors duration-200",
    ghost:
      "bg-transparent text-secondary hover:bg-secondary/10 transition-colors duration-200",
  },
  accent: {
    filled:
      "text-accent-foreground bg-accent hover:opacity-90 active:opacity-95",
    stroke:
      "bg-transparent text-accent border border-accent hover:bg-accent/10 transition-colors duration-200",
    ghost:
      "bg-transparent text-accent hover:bg-accent/10 transition-colors duration-200",
  },
  destructive: {
    filled:
      "text-destructive-foreground bg-destructive hover:opacity-90 active:opacity-95",
    stroke:
      "bg-transparent text-destructive border border-destructive hover:bg-destructive/10 transition-colors duration-200",
    ghost:
      "bg-transparent text-destructive hover:bg-destructive/10 transition-colors duration-200",
  },
  muted: {
    filled: "text-muted-foreground bg-muted hover:opacity-90 active:opacity-95",
    stroke:
      "bg-transparent text-muted border border-muted hover:bg-muted/10 transition-colors duration-200",
    ghost:
      "bg-transparent text-muted hover:bg-muted/10 transition-colors duration-200",
  },
  special: {
    filled: "text-white bg-special-button",
    stroke:
      "bg-transparent text-foreground border border-special hover:bg-special-button hover:text-white transition-colors duration-200",
    ghost:
      "bg-transparent text-foreground hover:bg-special-button hover:text-white transition-colors duration-200",
  },
};

export const SIZES: {
  [key in ButtonSizeType]: string;
} = {
  xs: "text-xs px-2 py-1",
  md: "text-sm px-3 py-1.5",
  lg: "text-base px-4 py-2",
};

export const ROUNDED: {
  [key in ButtonRoundedType]: string;
} = {
  none: "rounded-none",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
};
