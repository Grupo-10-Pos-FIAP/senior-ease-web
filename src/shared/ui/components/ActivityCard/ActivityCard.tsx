import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { type TaskStatus } from "@domain/entities/Task";
import { formatTaskDateRange } from "@shared/lib/formatTaskDate";
import { getTaskDeadlineBadgeLabel, getTaskDeadlineBadgeTone } from "@shared/lib/taskDeadline";
import "./ActivityCard.css";

interface ActivityCardProps {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  guideCompleted?: boolean;
  primaryAction?: ReactNode;
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

const STATUS_BADGE: Record<Exclude<TaskStatus, "active">, string> = {
  completed: "Atividade concluída",
  expired: "Atividade expirada!",
};

export function ActivityCard({
  id,
  title,
  startDate,
  endDate,
  status,
  guideCompleted = false,
  primaryAction,
}: ActivityCardProps) {
  const titleId = `activity-title-${id}`;
  const descriptionId = `activity-description-${id}`;
  const dateLabel = formatTaskDateRange(startDate, endDate);
  const deadlineBadgeLabel = status === "active" ? getTaskDeadlineBadgeLabel(endDate) : null;
  const deadlineBadgeTone = status === "active" ? getTaskDeadlineBadgeTone(endDate) : null;

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
      </article>
    );
  }

  const howToLabel = guideCompleted
    ? "Rever como fazer essa atividade"
    : "Como fazer essa atividade?";

  return (
    <article className="activity-card activity-card--active" aria-labelledby={titleId}>
      <div className="activity-card__content">
        {deadlineBadgeLabel && deadlineBadgeTone ? (
          <span
            className={`activity-card__badge activity-card__badge--deadline activity-card__badge--deadline-${deadlineBadgeTone}`}
          >
            {deadlineBadgeLabel}
          </span>
        ) : null}
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
          to={`/tarefas/${id}/guia`}
          className="se-button se-button--secondary activity-card__link"
          aria-label={`${howToLabel}: ${title}`}
        >
          <HowToIcon />
          {howToLabel}
        </Link>
        {primaryAction}
      </div>
    </article>
  );
}
