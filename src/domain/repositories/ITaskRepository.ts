import type { Task } from "@domain/entities/Task";
import type { StepCompletionPayload } from "@domain/value-objects/ActivityStepContent";

export interface ITaskRepository {
  list(userId: string): Promise<Task[]>;
  getById(id: string): Promise<Task>;
  complete(taskId: string): Promise<Task>;
  startActivity(taskId: string, stepId: string): Promise<Task>;
  completeStep(taskId: string, stepId: string, payload?: StepCompletionPayload): Promise<Task>;
  updateCurrentStep(taskId: string, stepId: string): Promise<Task>;
  resetActivity(taskId: string): Promise<Task>;
}
