import { useNavigate } from "react-router-dom";
import { useAccessibility } from "@app/providers/accessibilityContext";
import { useConfirmCriticalAction } from "@presentation/hooks/useConfirmCriticalAction";
import { Button, ConfirmDialog } from "@shared/ui";
import { LaterIcon } from "@presentation/features/tasks/guide/TutorialActionIcons";
import "@shared/ui/components/Button/Button.css";

interface ActivityExitActionProps {
  to?: string;
  label?: string;
  className?: string;
}

export function ActivityExitAction({
  to = "/",
  label = "Sair e voltar depois",
  className = "",
}: ActivityExitActionProps) {
  const navigate = useNavigate();
  const { preferences } = useAccessibility();
  const { pending, runIfAllowed, confirm, cancel, isOpen } = useConfirmCriticalAction();
  const isAdvancedMode = preferences.interfaceMode === "standard";

  const handleExit = () => {
    const exit = () => {
      void navigate(to);
    };

    if (isAdvancedMode) {
      exit();
      return;
    }

    runIfAllowed(exit, {
      title: "Sair e voltar depois?",
      description: "Seu progresso ficará salvo. Você pode continuar esta atividade quando quiser.",
      confirmLabel: "Sim, sair agora",
      cancelLabel: "Não, continuar na atividade",
      alwaysConfirm: true,
      confirmVariant: "warning",
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className={`activity-execution__nav-button activity-execution__exit-button ${className}`.trim()}
        aria-label={label}
        onClick={handleExit}
      >
        <LaterIcon />
        {label}
      </Button>
      <ConfirmDialog
        open={isOpen}
        title={pending?.options.title ?? ""}
        description={pending?.options.description ?? ""}
        confirmLabel={pending?.options.confirmLabel}
        cancelLabel={pending?.options.cancelLabel}
        confirmVariant={pending?.options.confirmVariant}
        onConfirm={confirm}
        onCancel={cancel}
      />
    </>
  );
}
