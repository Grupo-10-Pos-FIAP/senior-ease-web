import { useNavigate } from "react-router-dom";
import { useConfirmCriticalAction } from "@presentation/hooks/useConfirmCriticalAction";
import { ConfirmDialog } from "@shared/ui";
import "@shared/ui/components/Button/Button.css";

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

interface ActivityRedoActionProps {
  taskId: string;
  taskTitle: string;
  className?: string;
}

export function ActivityRedoAction({
  taskId,
  taskTitle,
  className = "se-button se-button--secondary activity-card__link",
}: ActivityRedoActionProps) {
  const navigate = useNavigate();
  const { pending, runIfAllowed, confirm, cancel, isOpen } = useConfirmCriticalAction();
  const ariaLabel = `Refazer atividade: ${taskTitle}`;

  const handleRedo = () => {
    runIfAllowed(
      () => {
        void navigate(`/tarefas/${taskId}`);
      },
      {
        title: "Refazer esta atividade?",
        description: `O prazo desta atividade já expirou. Você está prestes a refazer "${taskTitle}". Deseja continuar?`,
        confirmLabel: "Sim, refazer atividade",
        cancelLabel: "Não, voltar",
        alwaysConfirm: true,
      },
    );
  };

  return (
    <>
      <button type="button" className={className} aria-label={ariaLabel} onClick={handleRedo}>
        <RedoIcon />
        Refazer atividade
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
