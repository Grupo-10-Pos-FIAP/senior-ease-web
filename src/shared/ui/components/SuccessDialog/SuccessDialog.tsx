import { AlertDialog } from "radix-ui";
import { Button } from "@shared/ui/components/Button";
import "./SuccessDialog.css";

interface SuccessDialogProps {
  open: boolean;
  title?: string;
  description: string;
  confirmLabel?: string;
  onClose: () => void;
}

export function SuccessDialog({
  open,
  title = "Salvo com sucesso!",
  description,
  confirmLabel = "Entendi",
  onClose,
}: SuccessDialogProps) {
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
          <AlertDialog.Title className="success-dialog__title">{title}</AlertDialog.Title>
          <AlertDialog.Description className="success-dialog__description">
            {description}
          </AlertDialog.Description>
          <div className="success-dialog__actions">
            <AlertDialog.Action asChild>
              <Button variant="primary" className="success-dialog__button" onClick={onClose}>
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
