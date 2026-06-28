import { isTaskActive } from '@domain/entities/Task'
import type { Task } from '@domain/entities/Task'
import { TaskNotCompletableError } from '@domain/errors/TaskNotCompletableError'
import type { ITaskRepository } from '@domain/repositories/ITaskRepository'

export class CompleteTask {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(taskId: string): Promise<Task> {
    const task = await this.repository.getById(taskId)

    if (!isTaskActive(task)) {
      throw new TaskNotCompletableError(taskId)
    }

    return this.repository.complete(taskId)
  }
}
