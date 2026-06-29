import type {
  ActivityStepContent,
  StepCompletionPayload,
} from "@domain/value-objects/ActivityStepContent";
import { canCompleteStepContent } from "@domain/value-objects/ActivityStepContent";
import type { Task, TaskStep } from "@domain/entities/Task";

export interface StepProgressInfo {
  current: number;
  total: number;
  remaining: number;
}

export function getSortedSteps(task: Task): TaskStep[] {
  return [...task.steps].sort((a, b) => a.order - b.order);
}

export function getFirstIncompleteStepId(task: Task): string | null {
  const sorted = getSortedSteps(task);
  const firstIncomplete = sorted.find((step) => !step.completed);
  return firstIncomplete?.id ?? null;
}

export function getInitialStepId(task: Task): string {
  const sorted = getSortedSteps(task);

  if (sorted.length === 0) {
    throw new Error("Atividade sem tarefas");
  }

  return getFirstIncompleteStepId(task) ?? sorted[0].id;
}

export function getResumeStepId(task: Task): string {
  const sorted = getSortedSteps(task);

  if (sorted.length === 0) {
    throw new Error("Atividade sem tarefas");
  }

  if (task.currentStepId) {
    const exists = sorted.some((step) => step.id === task.currentStepId);
    if (exists) {
      return task.currentStepId;
    }
  }

  const firstIncomplete = getFirstIncompleteStepId(task);
  return firstIncomplete ?? sorted[0].id;
}

export function getStepProgress(task: Task, stepId: string): StepProgressInfo {
  const sorted = getSortedSteps(task);
  const index = sorted.findIndex((step) => step.id === stepId);
  const current = index >= 0 ? index + 1 : 1;
  const total = sorted.length;
  const completedCount = sorted.filter((step) => step.completed).length;
  const remaining = Math.max(total - completedCount, 0);

  return { current, total, remaining };
}

export function isTaskFullyCompleted(task: Task): boolean {
  const sorted = getSortedSteps(task);
  return sorted.length > 0 && sorted.every((step) => step.completed);
}

export function canCompleteStep(step: TaskStep, payload?: StepCompletionPayload): boolean {
  return canCompleteStepContent(step.content, payload);
}

export function canNavigateToStep(task: Task, stepId: string): boolean {
  const step = getSortedSteps(task).find((item) => item.id === stepId);
  return step?.completed ?? false;
}

export function canGoToNextStep(task: Task, currentStepId: string): boolean {
  const sorted = getSortedSteps(task);
  const currentIndex = sorted.findIndex((step) => step.id === currentStepId);

  if (currentIndex < 0 || currentIndex >= sorted.length - 1) {
    return false;
  }

  const currentStep = sorted[currentIndex];
  const nextStep = sorted[currentIndex + 1];

  if (nextStep.completed) {
    return true;
  }

  if (!currentStep.completed) {
    return false;
  }

  return nextStep.id === getFirstIncompleteStepId(task);
}

export type { ActivityStepContent, StepCompletionPayload };
