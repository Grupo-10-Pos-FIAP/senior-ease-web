import { Link } from "react-router-dom";
import "./IncompleteProfileCallout.css";

interface IncompleteProfileCalloutProps {
  description: string;
  /** CTA opcional — use na tela de atividades; na Conta o botão "Editar" já existe abaixo. */
  actionLabel?: string;
  actionTo?: string;
}

function WarningIcon() {
  return (
    <svg
      className="incomplete-profile-callout__icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 3.2 21.5 19.5H2.5L12 3.2Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M12 9.5v4.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="16.75" r="1" fill="currentColor" />
    </svg>
  );
}

export function IncompleteProfileCallout({
  description,
  actionLabel,
  actionTo,
}: IncompleteProfileCalloutProps) {
  return (
    <div className="incomplete-profile-callout" role="status" aria-live="polite">
      <div className="incomplete-profile-callout__header">
        <WarningIcon />
        <p className="incomplete-profile-callout__title">Complete seu perfil</p>
      </div>
      <p className="incomplete-profile-callout__description">{description}</p>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="se-button se-button--primary incomplete-profile-callout__action"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
