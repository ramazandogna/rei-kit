// Checkbox.stories.tsx
import Checkbox from "./Checkbox";
import type {
  CheckboxSize,
  CheckboxRounded,
  CheckboxColor,
} from "./Checkbox.types";

export default {
  title: "Components/Checkbox",
  component: Checkbox,
};

export const AllVariants = () => {
  const colors: CheckboxColor[] = [
    "primary",
    "secondary",
    "accent",
    "destructive",
    "muted",
  ];
  const sizes: CheckboxSize[] = ["sm", "md", "lg"];
  const roundedOptions: CheckboxRounded[] = ["none", "md", "lg", "full"];

  return (
    <div className="space-y-4">
      {colors.map((color) => (
        <div key={color} className="space-x-4">
          {sizes.map((size) => (
            <Checkbox
              key={`${color}-${size}`}
              label={`${color} ${size}`}
              color={color}
              size={size}
              rounded="md"
            />
          ))}
        </div>
      ))}

      <div className="flex gap-4 mt-4">
        {roundedOptions.map((rounded) => (
          <Checkbox key={rounded} label={rounded} rounded={rounded} />
        ))}
      </div>
    </div>
  );
};
