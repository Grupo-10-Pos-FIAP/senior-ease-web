import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import type { ActivityProgress } from "@domain/entities/Task";
import { useAccessibility } from "@app/providers/accessibilityContext";
import {
  getActivityPrimaryActionLabel,
  getEffectiveActivityProgress,
  getStartActivityConfirmOptions,
} from "@presentation/features/tasks/activityPrimaryAction.shared";
import { PlayIcon } from "@presentation/features/tasks/guide/TutorialActionIcons";
import { useConfirmCriticalAction } from "@presentation/hooks/useConfirmCriticalAction";
import { ConfirmDialog } from "@shared/ui";
import "@shared/ui/components/Button/Button.css";

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
  const { preferences } = useAccessibility();
  const { pending, runIfAllowed, confirm, cancel, isOpen } = useConfirmCriticalAction();
  const effectiveProgress = getEffectiveActivityProgress(progress);
  const label = getActivityPrimaryActionLabel(progress, preferences.interfaceMode);
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
    const startActivity = () => {
      void navigate(`/tarefas/${taskId}`);
    };

    if (preferences.interfaceMode === "standard") {
      startActivity();
      return;
    }

    runIfAllowed(startActivity, getStartActivityConfirmOptions(taskTitle));
  };

  return (
    <>
      <button type="button" className={className} aria-label={ariaLabel} onClick={handleStart}>
        <PlayIcon />
        {label}
      </button>
      {preferences.interfaceMode === "simplified" ? (
        <ConfirmDialog
          open={isOpen}
          title={pending?.options.title ?? ""}
          description={pending?.options.description}
          confirmLabel={pending?.options.confirmLabel}
          cancelLabel={pending?.options.cancelLabel}
          confirmVariant={pending?.options.confirmVariant}
          onConfirm={confirm}
          onCancel={cancel}
        />
      ) : null}
    </>
  );
}
