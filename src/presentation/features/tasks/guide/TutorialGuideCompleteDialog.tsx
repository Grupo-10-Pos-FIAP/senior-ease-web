import { AlertDialog } from "radix-ui";
import { Button } from "@shared/ui/components/Button";
import "@shared/ui/components/SuccessDialog/SuccessDialog.css";

interface TutorialGuideCompleteDialogProps {
  open: boolean;
  taskTitle: string;
  activityInProgress: boolean;
  onBackToActivities: () => void;
  onStartActivity: () => void;
  onClose: () => void;
}

export function TutorialGuideCompleteDialog({
  open,
  taskTitle,
  activityInProgress,
  onBackToActivities,
  onStartActivity,
  onClose,
}: TutorialGuideCompleteDialogProps) {
  const startLabel = activityInProgress ? "Continuar a atividade" : "Iniciar a atividade";

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
            Você viu todas as tarefas de &quot;{taskTitle}&quot; e já sabe como fazer cada uma.
            Deseja começar a atividade agora ou voltar para Minhas atividades?
          </AlertDialog.Description>
          <div className="success-dialog__actions success-dialog__actions--split">
            <Button
              variant="secondary"
              className="success-dialog__button"
              onClick={onBackToActivities}
            >
              Voltar para Minhas atividades
            </Button>
            <Button variant="primary" className="success-dialog__button" onClick={onStartActivity}>
              {startLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
