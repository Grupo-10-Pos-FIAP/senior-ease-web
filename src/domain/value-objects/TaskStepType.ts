export type TaskStepType =
  | "multiple_choice"
  | "open_question"
  | "content_reading"
  | "watch_content";

const VALID_TYPES: readonly TaskStepType[] = [
  "multiple_choice",
  "open_question",
  "content_reading",
  "watch_content",
];

export const DEFAULT_TASK_STEP_TYPE: TaskStepType = "content_reading";

export function isTaskStepType(value: unknown): value is TaskStepType {
  return typeof value === "string" && VALID_TYPES.includes(value as TaskStepType);
}

export function createTaskStepType(value: unknown): TaskStepType {
  if (!isTaskStepType(value)) {
    throw new Error(`Tipo de tarefa inválido: ${String(value)}`);
  }
  return value;
}
