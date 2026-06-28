import type { Task } from '@domain/entities/Task'
import { createTask } from '@domain/entities/Task'
import { TaskNotFoundError } from '@domain/errors/TaskNotFoundError'
import type { ITaskRepository } from '@domain/repositories/ITaskRepository'

export class FakeTaskRepository implements ITaskRepository {
  private tasks: Map<string, Task>

  constructor(initialTasks: Task[] = []) {
    this.tasks = new Map(initialTasks.map((task) => [task.id, task]))
  }

  async list(userId: string): Promise<Task[]> {
    void userId
    return [...this.tasks.values()]
  }

  async getById(id: string): Promise<Task> {
    const task = this.tasks.get(id)
    if (!task) {
      throw new TaskNotFoundError(id)
    }
    return task
  }

  async complete(taskId: string): Promise<Task> {
    const task = await this.getById(taskId)
    const completed = createTask({ ...task, status: 'completed' })
    this.tasks.set(taskId, completed)
    return completed
  }
}
