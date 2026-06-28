import { Link } from 'react-router-dom'
import type { TaskStatus } from '@domain/entities/Task'
import { Button } from '@shared/ui/components/Button'
import { formatTaskDateRange } from '@shared/lib/formatTaskDate'
import './ActivityCard.css'

interface ActivityCardProps {
  id: string
  title: string
  startDate: string
  endDate: string
  status: TaskStatus
  onComplete?: (id: string) => void
  isCompleting?: boolean
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
  )
}

function StepByStepIcon() {
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
        d="M4 1.5h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1Zm1 3v1h6V4.5H5Zm0 2.5v1h6V7H5Zm0 2.5v1h4v-1H5Z"
      />
    </svg>
  )
}

function CheckIcon() {
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
        d="M13.485 3.515a.75.75 0 0 1 0 1.06l-6.5 6.5a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06L6.5 9.318l5.97-5.97a.75.75 0 0 1 1.015-.033Z"
      />
    </svg>
  )
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
  )
}

const STATUS_BADGE: Record<Exclude<TaskStatus, 'active'>, string> = {
  completed: 'Atividade concluída',
  expired: 'Atividade expirada!',
}

export function ActivityCard({
  id,
  title,
  startDate,
  endDate,
  status,
  onComplete,
  isCompleting = false,
}: ActivityCardProps) {
  const titleId = `activity-title-${id}`
  const descriptionId = `activity-description-${id}`
  const dateLabel = formatTaskDateRange(startDate, endDate)

  if (status === 'completed') {
    return (
      <article
        className="activity-card activity-card--completed"
        aria-labelledby={titleId}
      >
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
    )
  }

  if (status === 'expired') {
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
    )
  }

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
          to={`/tarefas/${id}`}
          className="se-button se-button--secondary activity-card__link"
        >
          <StepByStepIcon />
          Ver passo-a-passo
        </Link>
        {onComplete ? (
          <Button
            variant="primary"
            className="activity-card__complete-btn"
            onClick={() => onComplete(id)}
            disabled={isCompleting}
            aria-label={`Concluir atividade: ${title}`}
          >
            <CheckIcon />
            Concluir atividade
          </Button>
        ) : null}
      </div>
    </article>
  )
}
