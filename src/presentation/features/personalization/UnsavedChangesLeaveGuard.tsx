import { ConfirmDialog } from "@shared/ui";
import { useUnsavedChangesBlocker } from "@presentation/hooks/useUnsavedChangesBlocker";

interface UnsavedChangesLeaveGuardProps {
  isDirty: boolean;
}

export function UnsavedChangesLeaveGuard({ isDirty }: UnsavedChangesLeaveGuardProps) {
  const { showLeaveDialog, leaveDialogMessage, confirmLeave, cancelLeave } =
    useUnsavedChangesBlocker({ isDirty });

  return (
    <ConfirmDialog
      open={showLeaveDialog}
      title="Sair sem salvar?"
      description={leaveDialogMessage}
      confirmLabel="Sair sem salvar"
      cancelLabel="Continuar editando"
      onConfirm={confirmLeave}
      onCancel={cancelLeave}
    />
  );
}
