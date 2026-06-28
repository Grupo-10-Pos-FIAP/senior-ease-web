import { useCallback, useState } from "react";
import { useAccessibility } from "@app/providers/accessibilityContext";
import type { ConfirmDialogVariant } from "@shared/ui/components/ConfirmDialog/ConfirmDialog";

interface CriticalActionOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Quando true, exige confirmação mesmo com a preferência de confirmação desligada. */
  alwaysConfirm?: boolean;
  confirmVariant?: ConfirmDialogVariant;
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
      if (preferences.confirmCriticalActions || options.alwaysConfirm) {
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
