import { useId, type ReactNode } from "react";
import "./PreferenceRow.css";

interface PreferenceRowProps {
  icon: ReactNode;
  label: string;
  description?: string;
  control: ReactNode | ((legendId: string) => ReactNode);
}

export function PreferenceRow({ icon, label, description, control }: PreferenceRowProps) {
  const legendId = useId();
  const resolvedControl = typeof control === "function" ? control(legendId) : control;

  return (
    <fieldset className="preference-row">
      <legend id={legendId} className="preference-row__legend">
        <span className="preference-row__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="preference-row__text">
          <span className="preference-row__label">{label}</span>
          {description ? <span className="preference-row__description">{description}</span> : null}
        </span>
      </legend>
      <div className="preference-row__control">{resolvedControl}</div>
    </fieldset>
  );
}
