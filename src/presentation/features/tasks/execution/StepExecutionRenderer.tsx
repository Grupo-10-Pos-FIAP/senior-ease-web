import { useEffect, useState } from "react";
import type { TaskStep } from "@domain/entities/Task";
import type { ActivityStepContent } from "@domain/value-objects/ActivityStepContent";
import { getTaskStepTypeLabel } from "@shared/lib/taskStepLabels";

interface StepExecutionRendererProps {
  step: TaskStep;
  onCanCompleteChange?: (ready: boolean) => void;
  onAnswerChange?: (answer: string) => void;
}

function getStepPrompt(
  label: string,
  question: string,
): { title: string; subtitle: string | null } {
  const trimmedLabel = label.trim();
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion || trimmedQuestion === trimmedLabel) {
    return { title: trimmedLabel, subtitle: null };
  }

  return { title: trimmedLabel, subtitle: trimmedQuestion };
}

function ReadingStepExecution({ content, label }: { content: ActivityStepContent; label: string }) {
  const body = content.kind === "content_reading" ? content.body : label;

  return (
    <article className="activity-execution__step-content" aria-labelledby="reading-step-title">
      <span className="activity-execution__step-type">
        {getTaskStepTypeLabel("content_reading")}
      </span>
      <h2 id="reading-step-title" className="activity-execution__step-title">
        {label}
      </h2>
      {body.split("\n\n").map((paragraph) => (
        <p key={paragraph.slice(0, 24)} className="activity-execution__paragraph">
          {paragraph}
        </p>
      ))}
    </article>
  );
}

function VideoStepExecution({ content, label }: { content: ActivityStepContent; label: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function handlePlay() {
    if (isPlaying && progress >= 100) {
      setProgress(0);
    }
    setIsPlaying(true);

    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          return 100;
        }
        return current + 10;
      });
    }, 400);
  }

  return (
    <article className="activity-execution__step-content" aria-labelledby="video-step-title">
      <span className="activity-execution__step-type">{getTaskStepTypeLabel("watch_content")}</span>
      <h2 id="video-step-title" className="activity-execution__step-title">
        {label}
      </h2>
      <div className="activity-execution__video" aria-label="Player de vídeo da atividade">
        <div className="activity-execution__video-screen">
          {!isPlaying || progress < 100 ? (
            <button
              type="button"
              className="activity-execution__play-button"
              onClick={handlePlay}
              aria-label={isPlaying ? "Reproduzindo vídeo" : "Reproduzir vídeo"}
            >
              ▶
            </button>
          ) : (
            <span className="activity-execution__video-done" aria-hidden="true">
              ✓
            </span>
          )}
        </div>
        {isPlaying ? (
          <div
            className="activity-execution__video-progress"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do vídeo"
          >
            <div
              className="activity-execution__video-progress-bar"
              style={{ width: `${String(progress)}%` }}
            />
          </div>
        ) : null}
      </div>
      {content.kind === "watch_content" && content.videoUrl ? (
        <p className="activity-execution__hint">Vídeo: {content.videoUrl}</p>
      ) : null}
    </article>
  );
}

function MultipleChoiceStepExecution({
  content,
  label,
  initialAnswer,
  onAnswerChange,
  onCanCompleteChange,
}: {
  content: ActivityStepContent;
  label: string;
  initialAnswer?: string;
  onAnswerChange?: (answer: string) => void;
  onCanCompleteChange?: (ready: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(initialAnswer ?? null);
  const question = content.kind === "multiple_choice" ? content.question : label;
  const options = content.kind === "multiple_choice" ? content.options : [];
  const { title, subtitle } = getStepPrompt(label, question);

  useEffect(() => {
    onCanCompleteChange?.(selected !== null);
  }, [onCanCompleteChange, selected]);

  useEffect(() => {
    if (selected) {
      onAnswerChange?.(selected);
    }
  }, [onAnswerChange, selected]);

  return (
    <article className="activity-execution__step-content" aria-labelledby="mc-step-title">
      <span className="activity-execution__step-type">
        {getTaskStepTypeLabel("multiple_choice")}
      </span>
      <h2 id="mc-step-title" className="activity-execution__step-title">
        {title}
      </h2>
      {subtitle ? <p className="activity-execution__question">{subtitle}</p> : null}
      <fieldset className="activity-execution__form">
        <legend className="visually-hidden">Escolha uma resposta</legend>
        <ul className="activity-execution__options">
          {options.map((option) => {
            const inputId = `mc-${option.id}`;
            const isSelected = selected === option.id;

            return (
              <li key={option.id}>
                <label
                  htmlFor={inputId}
                  className={`activity-execution__option${isSelected ? " activity-execution__option--selected" : ""}`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="activity-mc"
                    checked={isSelected}
                    onChange={() => {
                      setSelected(option.id);
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>
    </article>
  );
}

function OpenQuestionStepExecution({
  content,
  label,
  initialAnswer,
  onAnswerChange,
  onCanCompleteChange,
}: {
  content: ActivityStepContent;
  label: string;
  initialAnswer?: string;
  onAnswerChange?: (answer: string) => void;
  onCanCompleteChange?: (ready: boolean) => void;
}) {
  const [answer, setAnswer] = useState(initialAnswer ?? "");
  const question = content.kind === "open_question" ? content.question : label;
  const canSubmit = answer.trim().length >= 3;
  const { title, subtitle } = getStepPrompt(label, question);

  useEffect(() => {
    onCanCompleteChange?.(canSubmit);
  }, [canSubmit, onCanCompleteChange]);

  useEffect(() => {
    onAnswerChange?.(answer);
  }, [answer, onAnswerChange]);

  return (
    <article className="activity-execution__step-content" aria-labelledby="open-step-title">
      <span className="activity-execution__step-type">{getTaskStepTypeLabel("open_question")}</span>
      <h2 id="open-step-title" className="activity-execution__step-title">
        {title}
      </h2>
      {subtitle ? <p className="activity-execution__question">{subtitle}</p> : null}
      <label htmlFor="open-question-answer" className="activity-execution__field-label">
        Sua resposta
      </label>
      <textarea
        id="open-question-answer"
        className="activity-execution__textarea"
        placeholder="Digite sua resposta aqui…"
        value={answer}
        rows={6}
        onChange={(event) => {
          setAnswer(event.target.value);
        }}
      />
      {!canSubmit ? (
        <p className="activity-execution__hint">
          Escreva pelo menos algumas palavras para continuar.
        </p>
      ) : null}
    </article>
  );
}

function buildFallbackContent(step: TaskStep): ActivityStepContent {
  switch (step.type) {
    case "content_reading":
      return { kind: "content_reading", body: step.label };
    case "watch_content":
      return { kind: "watch_content", videoUrl: "" };
    case "multiple_choice":
      return {
        kind: "multiple_choice",
        question: step.label,
        options: [
          { id: "a", label: "Opção A" },
          { id: "b", label: "Opção B" },
        ],
      };
    case "open_question":
      return { kind: "open_question", question: step.label };
    default:
      return { kind: "content_reading", body: step.label };
  }
}

export function StepExecutionRenderer({
  step,
  onCanCompleteChange,
  onAnswerChange,
}: StepExecutionRendererProps) {
  const content = step.content ?? buildFallbackContent(step);
  const actionAlwaysEnabled = step.type === "content_reading" || step.type === "watch_content";

  useEffect(() => {
    if (actionAlwaysEnabled) {
      onCanCompleteChange?.(true);
    }
  }, [actionAlwaysEnabled, onCanCompleteChange]);

  switch (step.type) {
    case "content_reading":
      return <ReadingStepExecution content={content} label={step.label} />;
    case "watch_content":
      return <VideoStepExecution content={content} label={step.label} />;
    case "multiple_choice":
      return (
        <MultipleChoiceStepExecution
          content={content}
          label={step.label}
          initialAnswer={step.answer}
          onAnswerChange={onAnswerChange}
          onCanCompleteChange={onCanCompleteChange}
        />
      );
    case "open_question":
      return (
        <OpenQuestionStepExecution
          content={content}
          label={step.label}
          initialAnswer={step.answer}
          onAnswerChange={onAnswerChange}
          onCanCompleteChange={onCanCompleteChange}
        />
      );
    default:
      return <ReadingStepExecution content={content} label={step.label} />;
  }
}
