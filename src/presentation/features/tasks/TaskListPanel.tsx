import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "@domain/entities/Task";
import { ActivityCard, ActivityTabs } from "@shared/ui";
import { useTasksQuery } from "@app/hooks/useTasks";
import { ACTIVITY_TAB_OPTIONS, EMPTY_STATE_MESSAGES } from "@shared/lib/taskLabels";
import "./TaskListPanel.css";

function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status);
}

function TaskListContent({
  status,
  tasks,
  isLoading,
  isError,
}: {
  status: TaskStatus;
  tasks: Task[];
  isLoading: boolean;
  isError: boolean;
}) {
  const filtered = useMemo(() => filterTasksByStatus(tasks, status), [tasks, status]);

  if (isLoading) {
    return <p className="task-list-panel__status">Carregando atividades…</p>;
  }

  if (isError) {
    return (
      <p className="task-list-panel__status task-list-panel__status--error" role="alert">
        Não foi possível carregar suas atividades. Tente atualizar a página.
      </p>
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
            steps={task.steps}
          />
        </li>
      ))}
    </ul>
  );
}

export function TaskListPanel() {
  const [status, setStatus] = useState<TaskStatus>("active");

  const { data: tasks = [], isLoading, isError } = useTasksQuery();

  return (
    <section className="task-list-panel" aria-labelledby="activities-heading">
      <h1 id="activities-heading" className="visually-hidden">
        Minhas atividades
      </h1>

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
          />
        )}
      </ActivityTabs>
    </section>
  );
}
