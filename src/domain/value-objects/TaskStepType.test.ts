import { describe, expect, it } from "vitest";
import {
  createTaskStepType,
  DEFAULT_TASK_STEP_TYPE,
  isTaskStepType,
} from "@domain/value-objects/TaskStepType";

describe("TaskStepType", () => {
  it("identifica tipos válidos", () => {
    expect(isTaskStepType("multiple_choice")).toBe(true);
    expect(isTaskStepType("open_question")).toBe(true);
    expect(isTaskStepType("content_reading")).toBe(true);
    expect(isTaskStepType("watch_content")).toBe(true);
  });

  it("rejeita tipos inválidos", () => {
    expect(isTaskStepType("quiz")).toBe(false);
    expect(isTaskStepType(null)).toBe(false);
  });

  it("cria tipo válido", () => {
    expect(createTaskStepType("open_question")).toBe("open_question");
  });

  it("lança erro para tipo inválido", () => {
    expect(() => createTaskStepType("invalid")).toThrow(/tipo de tarefa inválido/i);
  });

  it("define fallback padrão", () => {
    expect(DEFAULT_TASK_STEP_TYPE).toBe("content_reading");
  });
});
