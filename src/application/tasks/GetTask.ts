import type { Task } from '@domain/entities/Task'
import type { ITaskRepository } from '@domain/repositories/ITaskRepository'

export class GetTask {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(taskId: string): Promise<Task> {
    return this.repository.getById(taskId)
  }
}
