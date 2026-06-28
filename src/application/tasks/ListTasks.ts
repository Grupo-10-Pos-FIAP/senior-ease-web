import type { Task } from '@domain/entities/Task'
import type { ITaskRepository } from '@domain/repositories/ITaskRepository'

export class ListTasks {
  constructor(private readonly repository: ITaskRepository) {}

  async execute(userId: string): Promise<Task[]> {
    return this.repository.list(userId)
  }
}
