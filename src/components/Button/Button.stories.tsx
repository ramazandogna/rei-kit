// Button.stories.tsx
import Button from "./Button";
import type {
  ButtonRoundedType,
  ButtonSizeType,
  ButtonStyleType,
  ButtonVariantType,
} from "./Button.types";

export default {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Global theme değişkenlerini kullanan özelleştirilebilir Button bileşeni.",
      },
    },
  },
  tags: ["autodocs"],
};

export const AllVariantsAndStyles = () => {
  const variants: ButtonVariantType[] = [
    "primary",
    "secondary",
    "accent",
    "destructive",
    "muted",
    "special",
  ];
  const styles: ButtonStyleType[] = ["filled", "stroke", "ghost"];

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
  const sizes: { size: ButtonSizeType; label: string }[] = [
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
  const roundedOptions: { rounded: ButtonRoundedType; label: string }[] = [
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

export const Loading = () => {
  return (
    <div className="flex gap-4">
      <Button loading>Default Loading</Button>
      <Button loading loadingText="Loading Custom Text...">
        Custom Loading
      </Button>
    </div>
  );
};

export const RoutedButton = () => {
  return (
    <div className="flex gap-4">
      <Button href="https://example.com" variant="primary">
        Go to Example
      </Button>
      <Button href="#" variant="destructive">
        Disabled Link
      </Button>
    </div>
  );
};
