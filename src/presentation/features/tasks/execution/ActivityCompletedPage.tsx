import { useParams } from "react-router-dom";
import { useTaskQuery } from "@app/hooks/useTasks";
import { getSortedSteps } from "@domain/entities/taskProgress";
import { BackToTasksLink } from "@presentation/features/tasks/guide/BackToTasksLink";
import "@shared/ui/components/Button/Button.css";
import "./ActivityExecutionPage.css";

export function ActivityCompletedPage() {
  const { id = "" } = useParams();
  const { data: task, isLoading, isError } = useTaskQuery(id);

  if (isLoading) {
    return <p className="activity-execution__status">Carregando…</p>;
  }

  if (isError || !task) {
    return (
      <section className="activity-execution" aria-labelledby="activity-completed-error">
        <h1 id="activity-completed-error" className="activity-execution__title">
          Atividade não encontrada
        </h1>
        <BackToTasksLink to="/" label="Voltar para Minhas atividades" />
      </section>
    );
  }

  const total = getSortedSteps(task).length;
  const completed = getSortedSteps(task).filter((step) => step.completed).length;

  return (
    <section
      className="activity-execution activity-execution--completed"
      aria-labelledby="activity-completed-title"
    >
      <div className="activity-execution__completed-card">
        <span className="activity-execution__completed-icon" aria-hidden="true">
          ✓
        </span>
        <h1 id="activity-completed-title" className="activity-execution__title">
          Parabéns! Você concluiu a atividade
        </h1>
        <p className="activity-execution__message">
          <strong>{task.title}</strong>
        </p>
        <p className="activity-execution__summary">
          Você respondeu {completed} de {total} {total === 1 ? "questão" : "questões"}. Muito bem!
        </p>
        <BackToTasksLink
          to="/"
          label="Voltar para Minhas atividades"
          className="activity-execution__completed-back"
        />
      </div>
    </section>
  );
}
