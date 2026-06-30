import type { Task } from "@domain/entities/Task";
import { TaskNotFoundError } from "@domain/errors/TaskNotFoundError";
import type { ITaskRepository } from "@domain/repositories/ITaskRepository";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { HttpError } from "@infrastructure/api/HttpClient";
import type { StepCompletionPayload } from "@domain/value-objects/ActivityStepContent";
import { isFirebaseConfigured } from "@infrastructure/firebase/client";
import { getCurrentAuthUser } from "@infrastructure/firebase/authService";
import { fromTaskDto, toTaskDto, type TaskDto } from "@infrastructure/mappers/task.mapper";

const DEFAULT_HTTP_USER_ID = "demo-user";

function resolveHttpUserId(): string {
  if (!isFirebaseConfigured()) {
    return DEFAULT_HTTP_USER_ID;
  }

  return getCurrentAuthUser()?.uid ?? DEFAULT_HTTP_USER_ID;
}

export class HttpTaskRepository implements ITaskRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async list(userId: string): Promise<Task[]> {
    const dtos = await this.httpClient.get<TaskDto[]>(
      `/api/tasks?userId=${encodeURIComponent(userId)}`,
    );
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
      const userId = resolveHttpUserId();
      const dto = await this.httpClient.patch<TaskDto>(
        `/api/tasks/${taskId}/complete?userId=${encodeURIComponent(userId)}`,
      );
      return fromTaskDto(dto);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        throw new TaskNotFoundError(taskId);
      }
      throw error;
    }
  }

  async startActivity(taskId: string, stepId: string): Promise<Task> {
    const userId = resolveHttpUserId();
    const dto = await this.httpClient.patch<TaskDto>(
      `/api/tasks/${taskId}/start?userId=${encodeURIComponent(userId)}`,
      { stepId },
    );
    return fromTaskDto(dto);
  }

  async completeStep(
    taskId: string,
    stepId: string,
    payload?: StepCompletionPayload,
  ): Promise<Task> {
    const userId = resolveHttpUserId();
    const dto = await this.httpClient.patch<TaskDto>(
      `/api/tasks/${taskId}/steps/${stepId}?userId=${encodeURIComponent(userId)}`,
      payload ?? {},
    );
    return fromTaskDto(dto);
  }

  async completeGuideStep(taskId: string, stepId: string): Promise<Task> {
    const userId = resolveHttpUserId();
    const dto = await this.httpClient.patch<TaskDto>(
      `/api/tasks/${taskId}/guide/${stepId}?userId=${encodeURIComponent(userId)}`,
    );
    return fromTaskDto(dto);
  }

  async updateCurrentStep(taskId: string, stepId: string): Promise<Task> {
    const userId = resolveHttpUserId();
    const dto = await this.httpClient.patch<TaskDto>(
      `/api/tasks/${taskId}/current-step?userId=${encodeURIComponent(userId)}`,
      { stepId },
    );
    return fromTaskDto(dto);
  }

  async resetActivity(taskId: string): Promise<Task> {
    const userId = resolveHttpUserId();
    const dto = await this.httpClient.patch<TaskDto>(
      `/api/tasks/${taskId}/reset?userId=${encodeURIComponent(userId)}`,
    );
    return fromTaskDto(dto);
  }
}

export { toTaskDto };
