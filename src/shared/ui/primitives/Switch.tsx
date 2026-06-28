import { Switch as RadixSwitch } from "radix-ui";
import type { ComponentPropsWithoutRef } from "react";
import "./Switch.css";

type SwitchProps = ComponentPropsWithoutRef<typeof RadixSwitch.Root> & {
  id: string;
  label?: string;
};

export function Switch({
  id,
  label,
  checked,
  onCheckedChange,
  disabled,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: SwitchProps) {
  const nameProps =
    ariaLabelledBy != null
      ? { "aria-labelledby": ariaLabelledBy }
      : { "aria-label": label ?? ariaLabel };

  return (
    <div className="se-switch">
      <RadixSwitch.Root
        id={id}
        className="se-switch__root"
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        {...props}
        {...nameProps}
      >
        <RadixSwitch.Thumb className="se-switch__thumb" />
      </RadixSwitch.Root>
      {label ? (
        <label htmlFor={id} className="se-switch__label">
          {label}
        </label>
      ) : null}
    </div>
  );
}
