import {
  createTaskStepType,
  type TaskStepType,
} from "@domain/value-objects/TaskStepType";

export type TaskStatus = "active" | "completed" | "expired";

export interface TaskStep {
  id: string;
  label: string;
  type: TaskStepType;
  completed: boolean;
  order: number;
}

export interface Task {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  steps: TaskStep[];
}

const TASK_STATUSES: TaskStatus[] = ["active", "completed", "expired"];
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function createTaskStep(
  input: Partial<TaskStep> & Pick<TaskStep, "id" | "label" | "order" | "type">,
): TaskStep {
  return {
    id: input.id,
    label: input.label.trim(),
    type: createTaskStepType(input.type),
    completed: input.completed ?? false,
    order: input.order,
  };
}

export function createTask(input: {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  steps?: TaskStep[];
}): Task {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Título da atividade é obrigatório");
  }

  if (!isValidIsoDate(input.startDate) || !isValidIsoDate(input.endDate)) {
    throw new Error("Datas da atividade devem estar no formato YYYY-MM-DD");
  }

  if (input.startDate > input.endDate) {
    throw new Error("Data inicial não pode ser posterior à data final");
  }

  if (!TASK_STATUSES.includes(input.status)) {
    throw new Error("Status da atividade inválido");
  }

  return {
    id: input.id,
    title,
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status,
    steps: (input.steps ?? []).map((step) => createTaskStep(step)),
  };
}

export type ActivityProgress = "not_started" | "in_progress";

export function isTaskActive(task: Task): boolean {
  return task.status === "active";
}

export function getActivityProgress(task: Task): ActivityProgress | null {
  if (task.status !== "active") return null;

  const hasCompletedStep = task.steps.some((step) => step.completed);
  return hasCompletedStep ? "in_progress" : "not_started";
}
