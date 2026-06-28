import { AlertDialog } from "radix-ui";
import { Button } from "@shared/ui/components/Button";
import "./ConfirmDialog.css";

export type ConfirmDialogVariant = "primary" | "danger";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ConfirmDialogVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel();
        }
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="confirm-dialog__overlay" />
        <AlertDialog.Content className="confirm-dialog__content">
          <AlertDialog.Title className="confirm-dialog__title">{title}</AlertDialog.Title>
          <AlertDialog.Description className="confirm-dialog__description">
            {description}
          </AlertDialog.Description>
          <div className="confirm-dialog__actions">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" className="confirm-dialog__button" onClick={onCancel}>
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant={confirmVariant === "danger" ? "danger-filled" : "primary"}
                className="confirm-dialog__button"
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
