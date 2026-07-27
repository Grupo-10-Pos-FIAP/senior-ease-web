import { useMemo, useState } from "react";
import { getActivityProgress, type Task, type TaskStatus } from "@domain/entities/Task";
import { isProfileIncomplete } from "@domain/entities/User";
import { useAccessibility } from "@app/providers/accessibilityContext";
import { ActivityCard, ActivityTabs, Button, type ActivityHowToPresentation } from "@shared/ui";
import { useTasksQuery } from "@app/hooks/useTasks";
import { useUserQuery } from "@presentation/hooks/useUserProfile";
import { IncompleteProfileCallout } from "@presentation/features/profile/IncompleteProfileCallout";
import { ACTIVITY_TAB_OPTIONS, EMPTY_STATE_MESSAGES } from "@shared/lib/taskLabels";
import { sortActiveTasksByDeadline } from "@shared/lib/taskDeadline";
import { ActivityPrimaryAction } from "./ActivityPrimaryAction";
import "./TaskListPanel.css";

function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  const filtered = tasks.filter((task) => task.status === status);

  if (status === "active") {
    return sortActiveTasksByDeadline(filtered);
  }

  return filtered;
}

function TaskListContent({
  status,
  tasks,
  isLoading,
  isError,
  onRetry,
  howToPresentation,
}: {
  status: TaskStatus;
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  howToPresentation: ActivityHowToPresentation;
}) {
  const filtered = useMemo(() => filterTasksByStatus(tasks, status), [tasks, status]);

  if (isLoading) {
    return <p className="task-list-panel__status">Carregando atividades…</p>;
  }

  if (isError) {
    return (
      <div className="task-list-panel__status task-list-panel__status--error" role="alert">
        <p className="task-list-panel__error-message">
          Não conseguimos conectar aos seus dados agora.
        </p>
        <Button type="button" variant="secondary" onClick={onRetry}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (filtered.length === 0) {
    return <p className="task-list-panel__empty">{EMPTY_STATE_MESSAGES[status]}</p>;
  }

  return (
    <ul className="task-list-panel__list">
      {filtered.map((task) => (
        <li key={task.id}>
          <ActivityCard
            id={task.id}
            title={task.title}
            startDate={task.startDate}
            endDate={task.endDate}
            status={task.status}
            guideCompleted={task.guideCompleted}
            howToPresentation={howToPresentation}
            primaryAction={
              <ActivityPrimaryAction
                taskId={task.id}
                taskTitle={task.title}
                progress={getActivityProgress(task)}
              />
            }
          />
        </li>
      ))}
    </ul>
  );
}

export function TaskListPanel() {
  const [status, setStatus] = useState<TaskStatus>("active");
  const { preferences } = useAccessibility();
  const { data: user } = useUserQuery();

  const { data: tasks = [], isLoading, isError, refetch } = useTasksQuery();
  const howToPresentation: ActivityHowToPresentation =
    preferences.interfaceMode === "simplified" ? "button" : "icon";
  const showIncompleteProfileCallout = user ? isProfileIncomplete(user) : false;

  return (
    <section className="task-list-panel" aria-labelledby="activities-heading">
      <h1 id="activities-heading" className="visually-hidden">
        Minhas atividades
      </h1>

      {showIncompleteProfileCallout ? (
        <IncompleteProfileCallout
          description='Algumas informações suas ainda estão faltando. Toque em "Completar perfil" abaixo para preenchê-las.'
          actionLabel="Completar perfil"
          actionTo="/perfil/conta?editar=1"
        />
      ) : null}

      <ActivityTabs
        value={status}
        onValueChange={setStatus}
        options={ACTIVITY_TAB_OPTIONS}
        ariaLabel="Filtrar atividades por status"
      >
        {(activeStatus) => (
          <TaskListContent
            status={activeStatus}
            tasks={tasks}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => {
              void refetch();
            }}
            howToPresentation={howToPresentation}
          />
        )}
      </ActivityTabs>
    </section>
  );
}
