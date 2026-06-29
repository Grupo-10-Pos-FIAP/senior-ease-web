import { Link } from "react-router-dom";
import { getActivityProgress, type TaskStatus, type TaskStep } from "@domain/entities/Task";
import { formatTaskDateRange } from "@shared/lib/formatTaskDate";
import "./ActivityCard.css";

interface ActivityCardProps {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  steps: TaskStep[];
}

function CalendarIcon() {
  return (
    <svg
      className="activity-card__calendar-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M5 1a1 1 0 0 1 1 1v1h4V2a1 1 0 1 1 2 0v1h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1V2a1 1 0 0 1 1-1Zm8 6H3v6h10V7Z"
      />
    </svg>
  );
}

function HowToIcon() {
  return (
    <svg
      className="activity-card__action-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="6" />
      <path d="M6.15 6.15a2 2 0 0 1 3.55 1.1c0 1.2-1.75 1.45-1.75 2.35" />
      <path d="M8 12h.01" strokeWidth="2" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg
      className="activity-card__action-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M4.5 2.75a1 1 0 0 1 1.52-.85l7 4.5a1 1 0 0 1 0 1.7l-7 4.5A1 1 0 0 1 4.5 11.5v-8.75Z"
      />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg
      className="activity-card__action-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M8 3a5 5 0 1 0 4.546 2.914.75.75 0 1 1 1.364-.632A6.5 6.5 0 1 1 8 1.5V3a.75.75 0 0 1-1.5 0V0A.75.75 0 0 1 8 .75V3Z"
      />
    </svg>
  );
}

const STATUS_BADGE: Record<Exclude<TaskStatus, "active">, string> = {
  completed: "Atividade concluída",
  expired: "Atividade expirada!",
};

const PRIMARY_ACTION_LABEL = {
  not_started: "Iniciar a atividade",
  in_progress: "Continuar a atividade",
} as const;

export function ActivityCard({ id, title, startDate, endDate, status, steps }: ActivityCardProps) {
  const titleId = `activity-title-${id}`;
  const descriptionId = `activity-description-${id}`;
  const dateLabel = formatTaskDateRange(startDate, endDate);

  if (status === "completed") {
    return (
      <article className="activity-card activity-card--completed" aria-labelledby={titleId}>
        <span className="activity-card__badge activity-card__badge--completed">
          {STATUS_BADGE.completed}
        </span>
        <h3 id={titleId} className="activity-card__title">
          {title}
        </h3>
        <p className="activity-card__dates">
          <CalendarIcon />
          <time dateTime={`${startDate}/${endDate}`}>{dateLabel}</time>
        </p>
      </article>
    );
  }

  if (status === "expired") {
    return (
      <article
        className="activity-card activity-card--expired"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <div className="activity-card__content">
          <span className="activity-card__badge activity-card__badge--expired">
            {STATUS_BADGE.expired}
          </span>
          <h3 id={titleId} className="activity-card__title">
            {title}
          </h3>
          <p id={descriptionId} className="activity-card__description">
            O prazo para essa atividade já se expirou.
          </p>
        </div>
        <div className="activity-card__actions">
          <Link
            to={`/tarefas/${id}`}
            className="se-button se-button--secondary activity-card__link"
          >
            <RedoIcon />
            Refazer atividade
          </Link>
        </div>
      </article>
    );
  }

  const progress = getActivityProgress({ id, title, startDate, endDate, status, steps });
  const primaryLabel = progress ? PRIMARY_ACTION_LABEL[progress] : PRIMARY_ACTION_LABEL.not_started;

  return (
    <article className="activity-card activity-card--active" aria-labelledby={titleId}>
      <div className="activity-card__content">
        <h3 id={titleId} className="activity-card__title">
          {title}
        </h3>
        <p className="activity-card__dates">
          <CalendarIcon />
          <time dateTime={`${startDate}/${endDate}`}>{dateLabel}</time>
        </p>
      </div>
      <div className="activity-card__actions">
        <Link
          to={`/tarefas/${id}?visao=guia`}
          className="se-button se-button--secondary activity-card__link"
          aria-label={`Como fazer essa atividade: ${title}`}
        >
          <HowToIcon />
          Como fazer essa atividade?
        </Link>
        <Link
          to={`/tarefas/${id}`}
          className="se-button se-button--primary activity-card__link activity-card__primary-link"
          aria-label={`${primaryLabel}: ${title}`}
        >
          <PlayIcon />
          {primaryLabel}
        </Link>
      </div>
    </article>
  );
}
