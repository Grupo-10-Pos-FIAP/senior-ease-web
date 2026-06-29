import { describe, expect, it } from "vitest";
import { createTask } from "@domain/entities/Task";
import {
  canNavigateToStep,
  canGoToNextStep,
  getFirstIncompleteStepId,
  getInitialStepId,
  getResumeStepId,
  getStepProgress,
  isTaskFullyCompleted,
} from "@domain/entities/taskProgress";

describe("taskProgress", () => {
  const task = createTask({
    id: "task-1",
    title: "Atividade",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    status: "active",
    startedAt: "2026-06-10T10:00:00.000Z",
    currentStepId: "step-2",
    steps: [
      {
        id: "step-1",
        label: "Leitura",
        type: "content_reading",
        completed: true,
        order: 1,
      },
      {
        id: "step-2",
        label: "Quiz",
        type: "multiple_choice",
        completed: false,
        order: 2,
      },
      {
        id: "step-3",
        label: "Reflexão",
        type: "open_question",
        completed: false,
        order: 3,
      },
    ],
  });

  it("calcula progresso da questão atual", () => {
    expect(getStepProgress(task, "step-2")).toEqual({
      current: 2,
      total: 3,
      remaining: 2,
    });
  });

  it("abre na primeira questão incompleta ao iniciar", () => {
    expect(getInitialStepId(task)).toBe("step-2");
  });

  it("abre na primeira questão quando nada foi concluído", () => {
    const fresh = createTask({
      ...task,
      currentStepId: undefined,
      steps: task.steps.map((step) => ({ ...step, completed: false })),
    });
    expect(getInitialStepId(fresh)).toBe("step-1");
  });

  it("retoma pela currentStepId quando válida", () => {
    expect(getResumeStepId(task)).toBe("step-2");
  });

  it("retoma pela primeira incompleta quando currentStepId é inválida", () => {
    const withoutCurrent = createTask({ ...task, currentStepId: "invalid" });
    expect(getResumeStepId(withoutCurrent)).toBe("step-2");
  });

  it("encontra primeira questão incompleta", () => {
    expect(getFirstIncompleteStepId(task)).toBe("step-2");
  });

  it("identifica quando todas as questões foram concluídas", () => {
    const completed = createTask({
      ...task,
      steps: task.steps.map((step) => ({ ...step, completed: true })),
    });
    expect(isTaskFullyCompleted(completed)).toBe(true);
    expect(getFirstIncompleteStepId(completed)).toBeNull();
  });

  it("identifica step navegável apenas quando concluído", () => {
    expect(canNavigateToStep(task, "step-1")).toBe(true);
    expect(canNavigateToStep(task, "step-2")).toBe(false);
    expect(canNavigateToStep(task, "step-3")).toBe(false);
  });

  it("permite avançar para a próxima incompleta quando a atual já foi concluída", () => {
    expect(canGoToNextStep(task, "step-1")).toBe(true);
    expect(canGoToNextStep(task, "step-2")).toBe(false);
  });

  it("permite avançar para questão concluída ao revisar etapas anteriores", () => {
    const partiallyDone = createTask({
      ...task,
      steps: [
        { ...task.steps[0], completed: true },
        { ...task.steps[1], completed: true },
        { ...task.steps[2], completed: false },
      ],
    });

    expect(canGoToNextStep(partiallyDone, "step-1")).toBe(true);
    expect(canGoToNextStep(partiallyDone, "step-2")).toBe(true);
    expect(canGoToNextStep(partiallyDone, "step-3")).toBe(false);
  });
});
