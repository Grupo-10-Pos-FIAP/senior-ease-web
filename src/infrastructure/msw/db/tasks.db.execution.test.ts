import { describe, expect, it } from "vitest";
import {
  completeStepInDb,
  getTaskFromDb,
  startActivityInDb,
} from "@infrastructure/msw/db/tasks.db";

describe("tasks.db execution", () => {
  it("inicia atividade gravando startedAt e currentStepId", () => {
    const result = startActivityInDb("task-1", "step-1-1");

    expect(result?.startedAt).toBeTruthy();
    expect(result?.currentStepId).toBe("step-1-1");
  });

  it("conclui step e marca atividade como completed no último passo", () => {
    startActivityInDb("task-1", "step-1-1");
    completeStepInDb("task-1", "step-1-1");
    completeStepInDb("task-1", "step-1-2", "demo-user", "a");
    completeStepInDb("task-1", "step-1-3", "demo-user", "Quero aprender e-mail");
    const final = completeStepInDb("task-1", "step-1-4");

    expect(final?.status).toBe("completed");
    expect(getTaskFromDb("task-1")?.steps.every((step) => step.completed)).toBe(true);
  });
});
