import { useId, type ReactNode } from "react";
import "./PreferenceRow.css";

interface PreferenceRowProps {
  icon: ReactNode;
  label: string;
  description?: string;
  control: ReactNode | ((legendId: string) => ReactNode);
}

export function PreferenceRow({ icon, label, description, control }: PreferenceRowProps) {
  const labelId = useId();
  const resolvedControl = typeof control === "function" ? control(labelId) : control;

  return (
    <div className="preference-row" role="group" aria-labelledby={labelId}>
      <div id={labelId} className="preference-row__legend">
        <span className="preference-row__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="preference-row__text">
          <span className="preference-row__label">{label}</span>
          {description ? <span className="preference-row__description">{description}</span> : null}
        </span>
      </div>
      <div className="preference-row__control">{resolvedControl}</div>
    </div>
  );
}
