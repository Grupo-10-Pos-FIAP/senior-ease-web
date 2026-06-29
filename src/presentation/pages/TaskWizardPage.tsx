import { useParams } from "react-router-dom";
import { useTaskQuery } from "@app/hooks/useTasks";
import { BackToTasksLink } from "@presentation/features/tasks/guide/BackToTasksLink";
import "@shared/ui/components/Button/Button.css";
import "./TaskWizardPage.css";

export function TaskWizardPage() {
  const { id = "" } = useParams();
  const { data: task, isLoading, isError } = useTaskQuery(id);

  if (isLoading) {
    return <p className="task-wizard-page__status">Carregando atividade…</p>;
  }

  if (isError || !task) {
    return (
      <section className="task-wizard-page" aria-labelledby="task-wizard-error">
        <h1 id="task-wizard-error" className="task-wizard-page__title">
          Atividade não encontrada
        </h1>
        <p className="task-wizard-page__message">
          Não encontramos esta atividade. Volte para a lista e tente novamente.
        </p>
        <BackToTasksLink
          to="/"
          label="Voltar para Minhas atividades"
          className="task-wizard-page__back"
        />
      </section>
    );
  }

  return (
    <section className="task-wizard-page" aria-labelledby="task-wizard-title">
      <h1 id="task-wizard-title" className="task-wizard-page__title">
        {task.title}
      </h1>
      <p className="task-wizard-page__message">Passo a passo em breve.</p>
      <BackToTasksLink
        to="/"
        label="Voltar para Minhas atividades"
        className="task-wizard-page__back"
      />
    </section>
  );
}
