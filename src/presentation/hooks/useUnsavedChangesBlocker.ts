import { useBlocker } from "react-router-dom";

interface UnsavedChangesBlockerOptions {
  isDirty: boolean;
  message?: string;
}

export function useUnsavedChangesBlocker({
  isDirty,
  message = "Você tem alterações não salvas. Deseja sair sem salvar?",
}: UnsavedChangesBlockerOptions) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname,
  );

  const confirmLeave = () => {
    blocker.proceed?.();
  };

  const cancelLeave = () => {
    blocker.reset?.();
  };

  return {
    showLeaveDialog: blocker.state === "blocked",
    leaveDialogMessage: message,
    confirmLeave,
    cancelLeave,
  };
}
