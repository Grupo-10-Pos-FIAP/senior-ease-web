import { isTaskActive } from "@domain/entities/Task";
import type { Task } from "@domain/entities/Task";
import { TaskStepNotFoundError } from "@domain/errors/TaskStepNotFoundError";
import type { ITaskRepository } from "@domain/repositories/ITaskRepository";

export class CompleteGuideStep {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(taskId: string, stepId: string): Promise<Task> {
    const task = await this.repository.getById(taskId);

    if (!isTaskActive(task)) {
      return task;
    }

    const stepExists = task.steps.some((step) => step.id === stepId);
    if (!stepExists) {
      throw new TaskStepNotFoundError(taskId, stepId);
    }

    return this.repository.completeGuideStep(taskId, stepId);
  }
}
