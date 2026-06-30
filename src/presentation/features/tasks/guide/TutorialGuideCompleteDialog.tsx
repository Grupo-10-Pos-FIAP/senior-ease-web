import { AlertDialog } from "radix-ui";
import type { ActivityProgress } from "@domain/entities/Task";
import {
  getActivityPrimaryActionLabel,
  getTutorialCompleteDescription,
} from "@presentation/features/tasks/activityPrimaryAction.shared";
import { PlayIcon } from "@presentation/features/tasks/guide/TutorialActionIcons";
import { Button } from "@shared/ui";
import "@shared/ui/components/Button/Button.css";
import "@shared/ui/components/ActivityCard/ActivityCard.css";
import "@shared/ui/components/SuccessDialog/SuccessDialog.css";

interface TutorialGuideCompleteDialogProps {
  open: boolean;
  taskTitle: string;
  activityProgress: ActivityProgress | null;
  onBackToActivities: () => void;
  onStartActivity: () => void;
  onClose: () => void;
}

export function TutorialGuideCompleteDialog({
  open,
  taskTitle,
  activityProgress,
  onBackToActivities,
  onStartActivity,
  onClose,
}: TutorialGuideCompleteDialogProps) {
  const primaryLabel = getActivityPrimaryActionLabel(activityProgress);
  const primaryAriaLabel = `${primaryLabel}: ${taskTitle}`;

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="success-dialog__overlay" />
        <AlertDialog.Content className="success-dialog__content">
          <AlertDialog.Title className="success-dialog__title">
            Parabéns! Você terminou o tutorial.
          </AlertDialog.Title>
          <AlertDialog.Description className="success-dialog__description">
            {getTutorialCompleteDescription(taskTitle, activityProgress)}
          </AlertDialog.Description>
          <div className="success-dialog__actions success-dialog__actions--split">
            <Button
              variant="secondary"
              className="success-dialog__button"
              onClick={onBackToActivities}
            >
              Voltar para Minhas atividades
            </Button>
            <button
              type="button"
              className="se-button se-button--primary activity-card__link activity-card__primary-link success-dialog__button"
              aria-label={primaryAriaLabel}
              onClick={onStartActivity}
            >
              <PlayIcon />
              {primaryLabel}
            </button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
