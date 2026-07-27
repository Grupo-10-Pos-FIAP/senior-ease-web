import type { Task, TaskStep } from "@domain/entities/Task";
import { getSortedSteps } from "@domain/entities/taskProgress";
import {
  isMultipleChoiceAnswerCorrect,
  type ActivityStepContent,
} from "@domain/value-objects/ActivityStepContent";

export interface ActivityAnswerResult {
  stepId: string;
  question: string;
  userAnswerLabel: string;
  correctOptionLabel: string;
  isCorrect: boolean;
}

export interface ActivityAnswerSummary {
  total: number;
  correct: number;
  incorrect: number;
}

type MultipleChoiceContent = Extract<ActivityStepContent, { kind: "multiple_choice" }>;

function resolveOptionLabel(content: MultipleChoiceContent, optionId: string | undefined): string {
  if (!optionId) {
    return "Sem resposta";
  }

  const option = content.options.find((item) => item.id === optionId);
  return option?.label ?? "Resposta não encontrada";
}

function toMultipleChoiceContent(step: TaskStep): MultipleChoiceContent | null {
  if (step.type !== "multiple_choice" || step.content?.kind !== "multiple_choice") {
    return null;
  }

  return step.content;
}

export function getActivityAnswerResults(task: Task): ActivityAnswerResult[] {
  return getSortedSteps(task).flatMap((step) => {
    const content = toMultipleChoiceContent(step);
    if (!content) {
      return [];
    }

    const correctOptionLabel = resolveOptionLabel(content, content.correctOptionId);

    return [
      {
        stepId: step.id,
        question: content.question,
        userAnswerLabel: resolveOptionLabel(content, step.answer),
        correctOptionLabel,
        isCorrect: isMultipleChoiceAnswerCorrect(content, step.answer),
      },
    ];
  });
}

export function summarizeActivityAnswers(results: ActivityAnswerResult[]): ActivityAnswerSummary {
  const total = results.length;
  const correct = results.filter((result) => result.isCorrect).length;

  return {
    total,
    correct,
    incorrect: total - correct,
  };
}
