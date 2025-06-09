import type { Meta, StoryObj } from "@storybook/react";
import Checkbox from "./Checkbox";
import type { CheckboxProps } from "./Checkbox.types";

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Temaya uygun, özelleştirilebilir Checkbox bileşenidir.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;

export const Playground: StoryObj<typeof Checkbox> = {
  args: {
    label: "Accept Terms",
    size: "md",
    color: "primary",
    rounded: "md",
    checked: false,
    disabled: false,
    errorMessage: "This is error",
    className: ""
  },
};

export const AllVariants = () => {
  const variants: CheckboxProps["color"][] = [
    "primary",
    "secondary",
    "accent",
    "destructive",
    "muted",
  ];
  const sizes: CheckboxProps["size"][] = ["sm", "md", "lg"];

  return (
    <div className="space-y-4">
      {variants.map((color) => (
        <div key={color} className="flex gap-4">
          {sizes.map((size) => (
            <Checkbox
              key={`${color}-${size}`}
              label={`${color}-${size}`}
              color={color}
              size={size}
              rounded="md"
              checked
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const AllRounded = () => {
  const roundedOptions: CheckboxProps["rounded"][] = [
    "none",
    "md",
    "lg",
    "full",
  ];

  return (
    <div className="flex gap-4">
      {roundedOptions.map((rounded) => (
        <Checkbox key={rounded} label={rounded} rounded={rounded} checked />
      ))}
    </div>
  );
};

export const WithError = {
  args: {
    label: "Accept Terms",
    checked: false,
    errorMessage: "You must agree to continue.",
  },
};

export const Disabled = {
  args: {
    label: "Disabled Checkbox",
    disabled: true,
    checked: true,
  },
};
