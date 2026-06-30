import type { Task } from "@domain/entities/Task";
import { createTask } from "@domain/entities/Task";
import { TaskNotFoundError } from "@domain/errors/TaskNotFoundError";
import type { StepCompletionPayload } from "@domain/value-objects/ActivityStepContent";
import type { ITaskRepository } from "@domain/repositories/ITaskRepository";

export class FakeTaskRepository implements ITaskRepository {
  private tasks: Map<string, Task>;
  private completedGuideSteps = new Map<string, Set<string>>();

  constructor(initialTasks: Task[] = []) {
    this.tasks = new Map(initialTasks.map((task) => [task.id, task]));
  }

  list(userId: string): Promise<Task[]> {
    void userId;
    return Promise.resolve([...this.tasks.values()]);
  }

  getById(id: string): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      return Promise.reject(new TaskNotFoundError(id));
    }
    return Promise.resolve(task);
  }

  async complete(taskId: string): Promise<Task> {
    const task = await this.getById(taskId);
    const completed = createTask({
      ...task,
      status: "completed",
      steps: task.steps.map((step) => ({ ...step, completed: true })),
    });
    this.tasks.set(taskId, completed);
    return completed;
  }

  async startActivity(taskId: string, stepId: string): Promise<Task> {
    const task = await this.getById(taskId);
    const updated = createTask({
      ...task,
      startedAt: task.startedAt ?? new Date().toISOString(),
      currentStepId: stepId,
    });
    this.tasks.set(taskId, updated);
    return updated;
  }

  async completeStep(
    taskId: string,
    stepId: string,
    payload?: StepCompletionPayload,
  ): Promise<Task> {
    const task = await this.getById(taskId);
    const updated = createTask({
      ...task,
      startedAt: task.startedAt ?? new Date().toISOString(),
      currentStepId: stepId,
      steps: task.steps.map((step) =>
        step.id === stepId
          ? { ...step, completed: true, answer: payload?.answer ?? step.answer }
          : step,
      ),
    });
    const allCompleted = updated.steps.every((step) => step.completed);
    const finalTask = createTask({
      ...updated,
      status: allCompleted ? "completed" : updated.status,
    });
    this.tasks.set(taskId, finalTask);
    return finalTask;
  }

  async updateCurrentStep(taskId: string, stepId: string): Promise<Task> {
    const task = await this.getById(taskId);
    const updated = createTask({
      ...task,
      startedAt: task.startedAt ?? new Date().toISOString(),
      currentStepId: stepId,
    });
    this.tasks.set(taskId, updated);
    return updated;
  }

  async resetActivity(taskId: string): Promise<Task> {
    const task = await this.getById(taskId);
    const reset = createTask({
      ...task,
      status: "active",
      startedAt: undefined,
      currentStepId: undefined,
      steps: task.steps.map((step) => ({ ...step, completed: false, answer: undefined })),
    });
    this.tasks.set(taskId, reset);
    return reset;
  }

  async completeGuideStep(taskId: string, stepId: string): Promise<Task> {
    const task = await this.getById(taskId);
    const completed = this.completedGuideSteps.get(taskId) ?? new Set<string>();
    completed.add(stepId);
    this.completedGuideSteps.set(taskId, completed);

    const guideCompleted =
      task.steps.length > 0 && task.steps.every((step) => completed.has(step.id));

    const updated = createTask({
      ...task,
      guideCompleted,
    });
    this.tasks.set(taskId, updated);
    return updated;
  }
}
