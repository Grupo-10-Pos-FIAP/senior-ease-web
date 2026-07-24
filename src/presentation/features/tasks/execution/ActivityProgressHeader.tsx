import type { Task } from "@domain/entities/Task";
import { getStepProgress, getSortedSteps } from "@domain/entities/taskProgress";

interface ActivityProgressHeaderProps {
  task: Task;
  stepId: string;
}

export function ActivityProgressHeader({ task, stepId }: ActivityProgressHeaderProps) {
  const { current, total } = getStepProgress(task, stepId);
  const completedCount = getSortedSteps(task).filter((step) => step.completed).length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <header className="activity-execution__progress-header">
      <p className="activity-execution__progress-label">
        {`Passo ${String(current)} de ${String(total)}`}
      </p>
      <div
        className="activity-execution__progress-bar"
        role="progressbar"
        aria-valuenow={completedCount}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Progresso da atividade: ${String(completedCount)} de ${String(total)} passos concluídos`}
      >
        <div
          className="activity-execution__progress-bar-fill"
          style={{ width: `${String(percent)}%` }}
        />
      </div>
    </header>
  );
}
