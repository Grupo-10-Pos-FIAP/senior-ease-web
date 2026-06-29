import { describe, expect, it } from "vitest";
import { createActivity } from "@domain/entities/Activity";
import { CompleteTaskStep } from "./CompleteTaskStep";
import { StartActivity } from "./StartActivity";
import { FakeTaskRepository } from "@shared/test/fakes/FakeTaskRepository";
import { createTask } from "@domain/entities/Task";

describe("StartActivity", () => {
  it("grava startedAt e currentStepId", async () => {
    const task = createTask({
      id: "task-1",
      title: "Atividade",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      status: "active",
      steps: [
        {
          id: "step-1",
          label: "Leitura",
          type: "content_reading",
          completed: false,
          order: 1,
        },
      ],
    });
    const repository = new FakeTaskRepository([task]);
    const useCase = new StartActivity(repository);

    const result = await useCase.execute("task-1", "step-1");

    expect(result.startedAt).toBeTruthy();
    expect(result.currentStepId).toBe("step-1");
  });
});

describe("CompleteTaskStep", () => {
  const activity = createActivity({
    id: "task-1",
    title: "Atividade",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    status: "active",
    steps: [
      { id: "step-1", label: "Leitura", type: "content_reading", order: 1 },
      { id: "step-2", label: "Quiz", type: "multiple_choice", order: 2 },
    ],
  });

  it("marca step como concluído e auto-completa atividade", async () => {
    const task = createTask({
      id: activity.id,
      title: activity.title,
      startDate: activity.startDate,
      endDate: activity.endDate,
      status: "active",
      steps: activity.steps.map((step, index) => ({
        id: step.id,
        label: step.label,
        type: step.type,
        order: step.order,
        completed: index === 0,
      })),
    });
    const repository = new FakeTaskRepository([task]);
    const useCase = new CompleteTaskStep(repository);

    const afterFirst = await useCase.execute("task-1", "step-2", { answer: "a" });
    expect(afterFirst.steps[1]?.completed).toBe(true);
    expect(afterFirst.status).toBe("completed");
  });

  it("rejeita resposta inválida em questão aberta", async () => {
    const task = createTask({
      id: "task-1",
      title: "Atividade",
      startDate: "2026-06-01",
      endDate: "2026-06-30",
      status: "active",
      steps: [
        {
          id: "step-1",
          label: "Reflexão",
          type: "open_question",
          completed: false,
          order: 1,
          content: { kind: "open_question", question: "O que aprendeu?" },
        },
      ],
    });
    const useCase = new CompleteTaskStep(new FakeTaskRepository([task]));

    await expect(useCase.execute("task-1", "step-1", { answer: "ok" })).rejects.toThrow(
      /não pode ser concluída/i,
    );
  });
});
