import { AlertDialog } from "radix-ui";
import { Button } from "@shared/ui/components/Button";
import "@shared/ui/components/ConfirmDialog/ConfirmDialog.css";

interface TutorialContinueDialogProps {
  open: boolean;
  hasNextStep: boolean;
  nextStepLabel?: string;
  onBackToList: () => void;
  onNextStep: () => void;
  onClose: () => void;
}

export function TutorialContinueDialog({
  open,
  hasNextStep,
  nextStepLabel,
  onBackToList,
  onNextStep,
  onClose,
}: TutorialContinueDialogProps) {
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
        <AlertDialog.Overlay className="confirm-dialog__overlay" />
        <AlertDialog.Content className="confirm-dialog__content">
          <AlertDialog.Title className="confirm-dialog__title">
            O que você deseja fazer agora?
          </AlertDialog.Title>
          <AlertDialog.Description className="confirm-dialog__description">
            {hasNextStep && nextStepLabel
              ? `Você pode voltar para a lista de tarefas ou seguir para "${nextStepLabel}".`
              : "Você pode voltar para a lista de tarefas desta atividade."}
          </AlertDialog.Description>
          <div className="confirm-dialog__actions">
            <Button variant="secondary" className="confirm-dialog__button" onClick={onBackToList}>
              Voltar para a lista de tarefas
            </Button>
            {hasNextStep ? (
              <Button variant="primary" className="confirm-dialog__button" onClick={onNextStep}>
                Ir para a próxima tarefa
              </Button>
            ) : null}
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
