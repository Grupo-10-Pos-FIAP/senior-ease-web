import type { Task } from '@domain/entities/Task'

export interface ITaskRepository {
  list(userId: string): Promise<Task[]>
  getById(id: string): Promise<Task>
  complete(taskId: string): Promise<Task>
}
