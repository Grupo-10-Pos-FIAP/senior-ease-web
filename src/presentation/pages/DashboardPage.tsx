import { useState } from "react";
import { useLocation } from "react-router-dom";
import { SuccessDialog } from "@shared/ui";
import { TaskListPanel } from "@presentation/features/tasks/TaskListPanel";

export function DashboardPage() {
  const location = useLocation();
  const [deletedMessage, setDeletedMessage] = useState<string | null>(() => {
    const state = location.state as { accountDeleted?: boolean } | null;
    if (state?.accountDeleted) {
      window.history.replaceState({}, document.title);
      return "Sua conta foi excluída permanentemente.";
    }
    return null;
  });

  return (
    <div className="dashboard-page">
      <SuccessDialog
        open={deletedMessage !== null}
        title="Conta excluída"
        description={deletedMessage ?? ""}
        onClose={() => {
          setDeletedMessage(null);
        }}
      />
      <TaskListPanel />
    </div>
  );
}
