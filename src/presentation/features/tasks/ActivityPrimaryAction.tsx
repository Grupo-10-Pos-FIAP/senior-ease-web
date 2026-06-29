import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import type { ActivityProgress } from "@domain/entities/Task";
import { useConfirmCriticalAction } from "@presentation/hooks/useConfirmCriticalAction";
import { ConfirmDialog } from "@shared/ui";
import "@shared/ui/components/Button/Button.css";

const PRIMARY_ACTION_LABEL = {
  not_started: "Iniciar a atividade",
  in_progress: "Continuar a atividade",
} as const;

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

interface ActivityPrimaryActionProps {
  taskId: string;
  taskTitle: string;
  progress: ActivityProgress | null;
  className?: string;
}

export function ActivityPrimaryAction({
  taskId,
  taskTitle,
  progress,
  className = "se-button se-button--primary activity-card__link activity-card__primary-link",
}: ActivityPrimaryActionProps) {
  const navigate = useNavigate();
  const { pending, runIfAllowed, confirm, cancel, isOpen } = useConfirmCriticalAction();
  const effectiveProgress = progress ?? "not_started";
  const label = PRIMARY_ACTION_LABEL[effectiveProgress];
  const ariaLabel = `${label}: ${taskTitle}`;

  if (effectiveProgress === "in_progress") {
    return (
      <Link to={`/tarefas/${taskId}`} className={className} aria-label={ariaLabel}>
        <PlayIcon />
        {label}
      </Link>
    );
  }

  const handleStart = () => {
    runIfAllowed(
      () => {
        void navigate(`/tarefas/${taskId}`);
      },
      {
        title: "Iniciar esta atividade?",
        description: `Você está prestes a começar a atividade "${taskTitle}". Deseja continuar agora?`,
        confirmLabel: "Sim, iniciar atividade",
        cancelLabel: "Não, ainda não",
        alwaysConfirm: true,
      },
    );
  };

  return (
    <>
      <button type="button" className={className} aria-label={ariaLabel} onClick={handleStart}>
        <PlayIcon />
        {label}
      </button>
      <ConfirmDialog
        open={isOpen}
        title={pending?.options.title ?? ""}
        description={pending?.options.description ?? ""}
        confirmLabel={pending?.options.confirmLabel}
        cancelLabel={pending?.options.cancelLabel}
        confirmVariant={pending?.options.confirmVariant}
        onConfirm={confirm}
        onCancel={cancel}
      />
    </>
  );
}
