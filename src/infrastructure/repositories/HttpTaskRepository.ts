import type { Task } from "@domain/entities/Task";
import { TaskNotFoundError } from "@domain/errors/TaskNotFoundError";
import type { ITaskRepository } from "@domain/repositories/ITaskRepository";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { HttpError } from "@infrastructure/api/HttpClient";
import { fromTaskDto, toTaskDto, type TaskDto } from "@infrastructure/mappers/task.mapper";

export class HttpTaskRepository implements ITaskRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(userId: string): Promise<Task[]> {
    void userId;
    const dtos = await this.httpClient.get<TaskDto[]>("/api/tasks");
    return dtos.map((dto) => fromTaskDto(dto));
  }

  async getById(id: string): Promise<Task> {
    try {
      const dto = await this.httpClient.get<TaskDto>(`/api/tasks/${id}`);
      return fromTaskDto(dto);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        throw new TaskNotFoundError(id);
      }
      throw error;
    }
  }

  async complete(taskId: string): Promise<Task> {
    try {
      const dto = await this.httpClient.patch<TaskDto>(`/api/tasks/${taskId}/complete`);
      return fromTaskDto(dto);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        throw new TaskNotFoundError(taskId);
      }
      throw error;
    }
  }
}

export { toTaskDto };
