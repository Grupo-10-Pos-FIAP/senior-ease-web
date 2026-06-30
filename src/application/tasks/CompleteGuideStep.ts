import type { Task } from "@domain/entities/Task";
import { TaskStepNotFoundError } from "@domain/errors/TaskStepNotFoundError";
import type { ITaskRepository } from "@domain/repositories/ITaskRepository";

export class CompleteGuideStep {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(taskId: string, stepId: string): Promise<Task> {
    const task = await this.repository.getById(taskId);

    const stepExists = task.steps.some((step) => step.id === stepId);
    if (!stepExists) {
      throw new TaskStepNotFoundError(taskId, stepId);
    }

    if (task.status === "expired") {
      return task;
    }

    return this.repository.completeGuideStep(taskId, stepId);
  }
}
