import { useEffect, useRef } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useStartActivityMutation, useTaskQuery } from "@app/hooks/useTasks";
import { getInitialStepId } from "@domain/entities/taskProgress";
import { BackToTasksLink } from "@presentation/features/tasks/guide/BackToTasksLink";
import "@shared/ui/components/Button/Button.css";
import "./ActivityExecutionPage.css";

export function TaskWizardEntry() {
  const { id = "" } = useParams();
  const { data: task, isLoading, isError } = useTaskQuery(id);
  const startActivity = useStartActivityMutation();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!task || task.status !== "active" || startedRef.current) {
      return;
    }

    startedRef.current = true;
    const stepId = getInitialStepId(task);

    if (!task.startedAt) {
      startActivity.mutate({ taskId: id, stepId });
    }
  }, [id, startActivity, task]);

  if (isLoading) {
    return <p className="activity-execution__status">Carregando atividade…</p>;
  }

  if (isError || !task) {
    return (
      <section className="activity-execution" aria-labelledby="activity-execution-error">
        <h1 id="activity-execution-error" className="activity-execution__title">
          Atividade não encontrada
        </h1>
        <p className="activity-execution__message">
          Não encontramos esta atividade. Volte para a lista e tente novamente.
        </p>
        <BackToTasksLink to="/" label="Voltar para Minhas atividades" />
      </section>
    );
  }

  if (task.status === "completed") {
    return <Navigate to={`/tarefas/${id}/concluida`} replace />;
  }

  if (task.status === "expired") {
    return (
      <section className="activity-execution" aria-labelledby="activity-execution-expired">
        <h1 id="activity-execution-expired" className="activity-execution__title">
          Atividade expirada
        </h1>
        <p className="activity-execution__message">
          O prazo desta atividade já passou. Você ainda pode refazê-la pela lista de atividades.
        </p>
        <BackToTasksLink to="/" label="Voltar para Minhas atividades" />
      </section>
    );
  }

  const stepId = getInitialStepId(task);
  return <Navigate to={`/tarefas/${id}/passo/${stepId}`} replace />;
}
