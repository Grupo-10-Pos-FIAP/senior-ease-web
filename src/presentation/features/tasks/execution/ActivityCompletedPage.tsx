import { useParams } from "react-router-dom";
import { useTaskQuery } from "@app/hooks/useTasks";
import type { Task } from "@domain/entities/Task";
import {
  getActivityAnswerResults,
  summarizeActivityAnswers,
} from "@domain/entities/activityAnswerResults";
import { getSortedSteps } from "@domain/entities/taskProgress";
import { BackToTasksLink } from "@presentation/features/tasks/guide/BackToTasksLink";
import { formatAnswerSummaryMessage } from "@presentation/features/tasks/execution/formatAnswerSummaryMessage";
import "@shared/ui/components/Button/Button.css";
import "./ActivityExecutionPage.css";

function ResultReviewIcon() {
  return (
    <svg
      className="activity-execution__completed-icon-svg"
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M9 4h6a1 1 0 0 1 1 1v1h1.5A1.5 1.5 0 0 1 19 7.5v12A1.5 1.5 0 0 1 17.5 21h-11A1.5 1.5 0 0 1 5 19.5v-12A1.5 1.5 0 0 1 6.5 6H8V5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9 6h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M8.5 11h7M8.5 14.5h7M8.5 18h4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ActivityCompletedContent({ task }: { task: Task }) {
  const totalSteps = getSortedSteps(task).length;
  const completedSteps = getSortedSteps(task).filter((step) => step.completed).length;
  const answerResults = getActivityAnswerResults(task);
  const answerSummary = summarizeActivityAnswers(answerResults);
  const hasGradedQuestions = answerSummary.total > 0;
  const hasIncorrectAnswers = hasGradedQuestions && answerSummary.incorrect > 0;
  const answersHeading = answerSummary.total === 1 ? "Sua resposta" : "Suas respostas";

  return (
    <section
      className="activity-execution activity-execution--completed"
      aria-labelledby="activity-completed-title"
    >
      <div className="activity-execution__completed-card">
        <span
          className={
            hasIncorrectAnswers
              ? "activity-execution__completed-icon activity-execution__completed-icon--neutral"
              : "activity-execution__completed-icon"
          }
          aria-hidden="true"
        >
          {hasIncorrectAnswers ? <ResultReviewIcon /> : "✓"}
        </span>
        <h1 id="activity-completed-title" className="activity-execution__title">
          {hasIncorrectAnswers
            ? "Você concluiu a atividade. Veja seu resultado."
            : "Parabéns! Você concluiu a atividade"}
        </h1>
        <p className="activity-execution__message">
          <strong>{task.title}</strong>
        </p>

        {hasGradedQuestions ? (
          <>
            <p className="activity-execution__summary" role="status">
              {formatAnswerSummaryMessage(answerSummary)}
            </p>

            <h2 id="activity-answers-heading" className="activity-execution__answers-heading">
              {answersHeading}
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
                    {result.isCorrect ? (
                      <>
                        <span aria-hidden="true">🎉</span> Parabéns! Você respondeu corretamente.
                        Continue assim!
                      </>
                    ) : (
                      <>
                        <span aria-hidden="true">💙</span> A resposta não foi a correta. Não tem
                        problema! Veja abaixo qual era a resposta certa.
                      </>
                    )}
                  </p>
                  <p className="activity-execution__answer-question">Pergunta: {result.question}</p>
                  <p className="activity-execution__answer-detail">
                    Sua resposta: {result.userAnswerLabel}
                  </p>
                  {!result.isCorrect ? (
                    <p className="activity-execution__answer-detail">
                      Resposta certa: {result.correctOptionLabel}
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

  if (task.id !== id) {
    return <p className="activity-execution__status">Carregando…</p>;
  }

  return <ActivityCompletedContent key={id} task={task} />;
}
