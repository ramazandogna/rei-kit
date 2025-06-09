import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";
import type { ButtonProps } from "./Button.types";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Tema değişkenleriyle stil alan, özelleştirilebilir Button bileşenidir.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

export const Playground: StoryObj<typeof Button> = {
  args: {
    children: "Tey",
    variant: "destructive",
    styleType: "stroke",
    size: "lg",
    rounded: "md",
    loading: false,
    disabled: false,
  },
};

export const AllVariantsAndStyles = () => {
  const variants: ButtonProps["variant"][] = [
    "primary",
    "secondary",
    "accent",
    "destructive",
    "muted",
    "special",
  ];
  const styles: ButtonProps["styleType"][] = ["filled", "stroke", "ghost"];

  return (
    <div className="grid grid-cols-3 gap-4">
      {variants.map((variant) =>
        styles.map((styleType) => (
          <div key={`${variant}-${styleType}`} className="flex flex-col gap-2">
            <Button variant={variant} styleType={styleType}>
              {variant} {styleType}
            </Button>
            <Button variant={variant} styleType={styleType} disabled>
              {variant} {styleType} (Disabled)
            </Button>
          </div>
        ))
      )}
    </div>
  );
};

export const AllSizes = () => {
  const sizes: { size: ButtonProps["size"]; label: string }[] = [
    { size: "xs", label: "XS Button" },
    { size: "md", label: "MD Button" },
    { size: "lg", label: "LG Button" },
  ];

  return (
    <div className="flex items-center gap-4">
      {sizes.map(({ size, label }) => (
        <Button key={size} size={size}>
          {label}
        </Button>
      ))}
    </div>
  );
};

export const AllRounded = () => {
  const roundedOptions: { rounded: ButtonProps["rounded"]; label: string }[] = [
    { rounded: "none", label: "None" },
    { rounded: "md", label: "Medium" },
    { rounded: "lg", label: "Large" },
    { rounded: "full", label: "Full" },
  ];

  return (
    <div className="flex gap-4">
      {roundedOptions.map(({ rounded, label }) => (
        <Button key={rounded} rounded={rounded}>
          {label}
        </Button>
      ))}
    </div>
  );
};

export const Loading = {
  args: {
    children: "Loading...",
    loading: true,
  },
};

export const Disabled = {
  args: {
    children: "Disabled",
    disabled: true,
  },
};

export const RoutedButton = {
  args: {
    href: "https://example.com",
    children: "Visit Example",
  },
};
