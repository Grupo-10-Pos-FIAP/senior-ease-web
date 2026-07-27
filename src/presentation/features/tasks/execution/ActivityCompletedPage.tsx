import { useParams } from "react-router-dom";
import { useTaskQuery } from "@app/hooks/useTasks";
import {
  getActivityAnswerResults,
  summarizeActivityAnswers,
} from "@domain/entities/activityAnswerResults";
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

  const totalSteps = getSortedSteps(task).length;
  const completedSteps = getSortedSteps(task).filter((step) => step.completed).length;
  const answerResults = getActivityAnswerResults(task);
  const answerSummary = summarizeActivityAnswers(answerResults);
  const hasGradedQuestions = answerSummary.total > 0;

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

        {hasGradedQuestions ? (
          <>
            <p className="activity-execution__summary" role="status">
              Você acertou {answerSummary.correct} de {answerSummary.total}{" "}
              {answerSummary.total === 1 ? "pergunta" : "perguntas"}.
              {answerSummary.incorrect > 0
                ? ` Errou ${String(answerSummary.incorrect)}.`
                : " Muito bem!"}
            </p>

            <h2 id="activity-answers-heading" className="activity-execution__answers-heading">
              Suas respostas
            </h2>
            <ul
              className="activity-execution__answers-list"
              aria-labelledby="activity-answers-heading"
            >
              {answerResults.map((result) => (
                <li
                  key={result.stepId}
                  className={
                    result.isCorrect
                      ? "activity-execution__answer-item activity-execution__answer-item--correct"
                      : "activity-execution__answer-item activity-execution__answer-item--incorrect"
                  }
                >
                  <p className="activity-execution__answer-status">
                    <span aria-hidden="true">{result.isCorrect ? "✓" : "✗"}</span>{" "}
                    {result.isCorrect ? "Acertou" : "Errou"}
                  </p>
                  <p className="activity-execution__answer-question">{result.question}</p>
                  <p className="activity-execution__answer-detail">
                    Sua resposta: {result.userAnswerLabel}
                  </p>
                  {!result.isCorrect ? (
                    <p className="activity-execution__answer-detail">
                      Resposta correta: {result.correctOptionLabel}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="activity-execution__summary">
            Você concluiu {completedSteps} de {totalSteps} {totalSteps === 1 ? "passo" : "passos"}.
            Muito bem!
          </p>
        )}

        <BackToTasksLink
          to="/"
          label="Voltar para Minhas atividades"
          className="activity-execution__completed-back"
        />
      </div>
    </section>
  );
}
