import { isTaskActive } from "@domain/entities/Task";
import type { Task } from "@domain/entities/Task";
import { TaskNotCompletableError } from "@domain/errors/TaskNotCompletableError";
import { TaskStepNotFoundError } from "@domain/errors/TaskStepNotFoundError";
import type { ITaskRepository } from "@domain/repositories/ITaskRepository";
import { getSortedSteps } from "@domain/entities/taskProgress";

export class UpdateCurrentStep {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(taskId: string, stepId: string): Promise<Task> {
    const task = await this.repository.getById(taskId);

    if (!isTaskActive(task)) {
      throw new TaskNotCompletableError(taskId);
    }

    const stepExists = getSortedSteps(task).some((step) => step.id === stepId);
    if (!stepExists) {
      throw new TaskStepNotFoundError(taskId, stepId);
    }

    return this.repository.updateCurrentStep(taskId, stepId);
  }
}
