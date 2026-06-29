import { createTask, type Task, type TaskStatus } from "@domain/entities/Task";
import type { ActivityStepContent } from "@domain/value-objects/ActivityStepContent";
import {
  createTaskStepType,
  DEFAULT_TASK_STEP_TYPE,
  type TaskStepType,
} from "@domain/value-objects/TaskStepType";

export interface TaskStepDto {
  id: string;
  label: string;
  type?: TaskStepType;
  completed: boolean;
  order: number;
  content?: ActivityStepContent;
  answer?: string;
}

export interface TaskDto {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  status: TaskStatus;
  steps: TaskStepDto[];
  startedAt?: string;
  currentStepId?: string;
}

export function toTaskDto(task: Task): TaskDto {
  return {
    id: task.id,
    title: task.title,
    startDate: task.startDate,
    endDate: task.endDate,
    status: task.status,
    startedAt: task.startedAt,
    currentStepId: task.currentStepId,
    steps: task.steps.map((step) => ({
      id: step.id,
      label: step.label,
      type: step.type,
      completed: step.completed,
      order: step.order,
      content: step.content,
      answer: step.answer,
    })),
  };
}

export function fromTaskDto(dto: TaskDto): Task {
  return createTask({
    id: dto.id,
    title: dto.title,
    startDate: dto.startDate,
    endDate: dto.endDate,
    status: dto.status,
    startedAt: dto.startedAt,
    currentStepId: dto.currentStepId,
    steps: dto.steps.map((step) => ({
      id: step.id,
      label: step.label,
      type: step.type ? createTaskStepType(step.type) : DEFAULT_TASK_STEP_TYPE,
      completed: step.completed,
      order: step.order,
      content: step.content,
      answer: step.answer,
    })),
  });
}
