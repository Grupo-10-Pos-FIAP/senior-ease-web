import { Link, useParams } from "react-router-dom";
import { useTaskQuery } from "@app/hooks/useTasks";
import { getActivityProgress } from "@domain/entities/Task";
import {
  getTaskStepGuideActionLabel,
  getTaskStepTypeLabel,
} from "@shared/lib/taskStepLabels";
import { ActivityPrimaryAction } from "@presentation/features/tasks/ActivityPrimaryAction";
import { BackToTasksLink } from "./BackToTasksLink";
import "@shared/ui/components/Button/Button.css";
import "@shared/ui/components/ActivityCard/ActivityCard.css";
import "./ActivityGuidePage.css";

export function ActivityGuidePage() {
  const { id = "" } = useParams();
  const { data: task, isLoading, isError } = useTaskQuery(id);

  if (isLoading) {
    return <p className="activity-guide__status">Carregando guia da atividade…</p>;
  }

  if (isError || !task) {
    return (
      <section className="activity-guide" aria-labelledby="activity-guide-error">
        <h1 id="activity-guide-error" className="activity-guide__title">
          Atividade não encontrada
        </h1>
        <p className="activity-guide__intro">
          Não encontramos esta atividade. Volte para a lista e tente novamente.
        </p>
        <div className="activity-guide__footer">
          <BackToTasksLink
            to="/"
            label="Voltar para Minhas atividades"
            className="activity-guide__link"
          />
        </div>
      </section>
    );
  }

  const sortedSteps = [...task.steps].sort((a, b) => a.order - b.order);
  const totalTasks = sortedSteps.length;
  const progress = getActivityProgress(task);

  return (
    <section className="activity-guide" aria-labelledby="activity-guide-title">
      <h1 id="activity-guide-title" className="activity-guide__title">
        Como fazer: {task.title}
      </h1>
      <p className="activity-guide__intro">
        Esta atividade tem <strong>{totalTasks} tarefas</strong> para você estudar. Em cada uma
        abaixo, toque no botão à direita para aprender como fazer antes de começar.
      </p>

      <h2 className="activity-guide__section-title">Tarefas desta atividade</h2>

      <ol className="activity-guide__list" aria-label="Tarefas desta atividade">
        {sortedSteps.map((step, index) => {
          const taskNumber = index + 1;
          const actionLabel = getTaskStepGuideActionLabel();

          return (
            <li key={step.id} className="activity-guide__item">
              <div className="activity-guide__item-body">
                <p className="activity-guide__task-position">
                  Tarefa {taskNumber} de {totalTasks}
                </p>
                <h3 className="activity-guide__step-label">{step.label}</h3>
                <span className="activity-guide__badge">{getTaskStepTypeLabel(step.type)}</span>
              </div>
              <div className="activity-guide__actions">
                <Link
                  to={`/tarefas/${id}/guia/${step.id}`}
                  className="se-button se-button--primary activity-guide__link"
                  aria-label={`${actionLabel}: ${step.label}`}
                >
                  {actionLabel}
                </Link>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="activity-guide__footer">
        <BackToTasksLink
          to="/"
          label="Voltar para Minhas atividades"
          className="activity-guide__link"
        />
        <ActivityPrimaryAction
          taskId={id}
          taskTitle={task.title}
          progress={progress}
          className="se-button se-button--primary activity-card__link activity-card__primary-link activity-guide__link"
        />
      </div>
    </section>
  );
}
