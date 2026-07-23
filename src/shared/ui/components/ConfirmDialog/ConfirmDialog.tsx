import { useRef } from "react";
import { AlertDialog } from "radix-ui";
import { Button } from "@shared/ui/components/Button";
import "./ConfirmDialog.css";

export type ConfirmDialogVariant = "primary" | "danger" | "warning" | "success";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
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
  const confirmedRef = useRef(false);
  const hasDescription = Boolean(description);

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          return;
        }

        // AlertDialog.Action também fecha o dialog e dispara onOpenChange(false).
        // Não tratar isso como cancelamento — senão o onCancel (ex.: signOut) corre
        // em paralelo com onConfirm e quebra ações assíncronas como reativar conta.
        if (confirmedRef.current) {
          confirmedRef.current = false;
          return;
        }

        onCancel();
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="confirm-dialog__overlay" />
        <AlertDialog.Content
          className="confirm-dialog__content"
          {...(!hasDescription ? { "aria-describedby": undefined } : {})}
        >
          <AlertDialog.Title className="confirm-dialog__title">{title}</AlertDialog.Title>
          {hasDescription ? (
            <AlertDialog.Description className="confirm-dialog__description">
              {description}
            </AlertDialog.Description>
          ) : null}
          <div className="confirm-dialog__actions">
            <AlertDialog.Cancel asChild>
              <Button variant="secondary" className="confirm-dialog__button">
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant={
                  confirmVariant === "danger"
                    ? "danger-filled"
                    : confirmVariant === "warning"
                      ? "warning-filled"
                      : confirmVariant === "success"
                        ? "success-filled"
                        : "primary"
                }
                className="confirm-dialog__button"
                onClick={() => {
                  confirmedRef.current = true;
                  onConfirm();
                }}
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
