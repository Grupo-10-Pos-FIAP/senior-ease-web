import { useCallback, useState } from "react";
import { useAccessibility } from "@app/providers/accessibilityContext";

interface CriticalActionOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface PendingAction {
  action: () => void;
  options: CriticalActionOptions;
}

export function useConfirmCriticalAction() {
  const { preferences } = useAccessibility();
  const [pending, setPending] = useState<PendingAction | null>(null);

  const runIfAllowed = useCallback(
    (action: () => void, options: CriticalActionOptions) => {
      if (preferences.confirmCriticalActions) {
        setPending({ action, options });
        return;
      }
      action();
    },
    [preferences.confirmCriticalActions],
  );

  const confirm = useCallback(() => {
    pending?.action();
    setPending(null);
  }, [pending]);

  const cancel = useCallback(() => {
    setPending(null);
  }, []);

  return {
    pending,
    runIfAllowed,
    confirm,
    cancel,
    isOpen: pending !== null,
  };
}
