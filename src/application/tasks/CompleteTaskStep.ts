import { canCompleteStep, getSortedSteps } from "@domain/entities/taskProgress";
import { isTaskActive } from "@domain/entities/Task";
import type { Task } from "@domain/entities/Task";
import { TaskNotCompletableError } from "@domain/errors/TaskNotCompletableError";
import { TaskStepNotCompletableError } from "@domain/errors/TaskStepNotCompletableError";
import { TaskStepNotFoundError } from "@domain/errors/TaskStepNotFoundError";
import type { ITaskRepository } from "@domain/repositories/ITaskRepository";
import type { StepCompletionPayload } from "@domain/value-objects/ActivityStepContent";

export class CompleteTaskStep {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(taskId: string, stepId: string, payload?: StepCompletionPayload): Promise<Task> {
    const task = await this.repository.getById(taskId);

    if (!isTaskActive(task)) {
      throw new TaskNotCompletableError(taskId);
    }

    const step = getSortedSteps(task).find((item) => item.id === stepId);
    if (!step) {
      throw new TaskStepNotFoundError(taskId, stepId);
    }

    if (!canCompleteStep(step, payload)) {
      throw new TaskStepNotCompletableError(taskId, stepId);
    }

    return this.repository.completeStep(taskId, stepId, payload);
  }
}
