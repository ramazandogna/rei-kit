import { useState } from "react";
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

const colors: CheckboxColor[] = [
  "primary",
  "secondary",
  "accent",
  "destructive",
  "muted",
];
const sizes: CheckboxSize[] = ["sm", "md", "lg"];
const roundedOptions: CheckboxRounded[] = ["none", "md", "lg", "full"];

export const AllVariants = () => {
  const [checkedState, setCheckedState] = useState<Record<string, boolean>>({});

  const handleChange = (key: string) => () =>
    setCheckedState((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4">
      {colors.map((color) => (
        <div key={color} className="space-x-4">
          {sizes.map((size) => {
            const key = `${color}-${size}`;
            return (
              <Checkbox
                key={key}
                label={key}
                color={color}
                size={size}
                rounded="md"
                checked={!!checkedState[key]}
                onChange={handleChange(key)}
              />
            );
          })}
        </div>
      ))}
      <div className="flex gap-4 mt-4">
        {roundedOptions.map((rounded) => (
          <Checkbox
            key={rounded}
            label={rounded}
            rounded={rounded}
            checked={!!checkedState[rounded]}
            onChange={handleChange(rounded)}
          />
        ))}
      </div>
    </div>
  );
};

export const WithError = () => {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox
      label="Accept Terms"
      checked={checked}
      onChange={() => setChecked((p) => !p)}
      errorMessage={!checked ? "You must agree to continue." : undefined}
    />
  );
};

export const Disabled = () => (
  <Checkbox label="Disabled Checkbox" disabled checked />
);
