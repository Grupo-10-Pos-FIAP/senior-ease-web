import { mergeActivityWithProgress } from "@application/tasks/mergeActivityWithProgress";
import type { Activity } from "@domain/entities/Activity";
import {
  createActivityProgress,
  createDefaultActivityProgress,
  type ActivityProgress,
} from "@domain/entities/ActivityProgress";
import { isTaskActive, type Task } from "@domain/entities/Task";
import { TaskNotCompletableError } from "@domain/errors/TaskNotCompletableError";
import { TaskNotFoundError } from "@domain/errors/TaskNotFoundError";
import type { IActivityCatalogRepository } from "@domain/repositories/IActivityCatalogRepository";
import type { IActivityProgressRepository } from "@domain/repositories/IActivityProgressRepository";
import type { ITaskRepository } from "@domain/repositories/ITaskRepository";
import { DEFAULT_COURSE_ID } from "@domain/constants/course";
import type { StepCompletionPayload } from "@domain/value-objects/ActivityStepContent";
import { getFirestoreDb } from "@infrastructure/firebase/client";
import { doc, getDoc } from "firebase/firestore";

export class FirestoreTaskRepository implements ITaskRepository {
  constructor(
    private readonly getCurrentUserId: () => string,
    private readonly catalogRepository: IActivityCatalogRepository,
    private readonly progressRepository: IActivityProgressRepository,
  ) {}

  private async getEnrolledCourseId(userId: string): Promise<string> {
    const snapshot = await getDoc(doc(getFirestoreDb(), "users", userId));

    if (!snapshot.exists()) {
      return DEFAULT_COURSE_ID;
    }

    const { enrolledCourseId } = snapshot.data() as { enrolledCourseId?: unknown };
    return typeof enrolledCourseId === "string" && enrolledCourseId.trim()
      ? enrolledCourseId
      : DEFAULT_COURSE_ID;
  }

  private async mergeTasksForUser(userId: string): Promise<Task[]> {
    const courseId = await this.getEnrolledCourseId(userId);
    const activities = await this.catalogRepository.listActivities(courseId);
    const progressList = await this.progressRepository.listProgress(userId);
    const progressByActivityId = new Map(
      progressList.map((progress) => [progress.activityId, progress]),
    );

    return activities.map((activity) =>
      mergeActivityWithProgress(
        activity,
        progressByActivityId.get(activity.id) ?? createDefaultActivityProgress(activity.id),
      ),
    );
  }

  private async getActivityAndProgress(
    userId: string,
    taskId: string,
  ): Promise<{ activity: Activity; progress: ActivityProgress; courseId: string }> {
    const courseId = await this.getEnrolledCourseId(userId);
    const activity = await this.catalogRepository.getActivity(courseId, taskId);
    const progress =
      (await this.progressRepository.getProgress(userId, taskId)) ??
      createDefaultActivityProgress(taskId);

    return { activity, progress, courseId };
  }

  private async saveMergedProgress(
    userId: string,
    activity: Activity,
    progress: ActivityProgress,
  ): Promise<Task> {
    await this.progressRepository.saveProgress(userId, progress);
    return mergeActivityWithProgress(activity, progress);
  }

  async list(userId: string): Promise<Task[]> {
    return this.mergeTasksForUser(userId);
  }

  async getById(id: string): Promise<Task> {
    const userId = this.getCurrentUserId();
    const courseId = await this.getEnrolledCourseId(userId);

    try {
      const activity = await this.catalogRepository.getActivity(courseId, id);
      const progress =
        (await this.progressRepository.getProgress(userId, id)) ??
        createDefaultActivityProgress(id);

      return mergeActivityWithProgress(activity, progress);
    } catch (error) {
      if (error instanceof TaskNotFoundError) {
        throw error;
      }
      throw error;
    }
  }

  async complete(taskId: string): Promise<Task> {
    const userId = this.getCurrentUserId();
    const task = await this.getById(taskId);

    if (!isTaskActive(task)) {
      throw new TaskNotCompletableError(taskId);
    }

    const { activity, progress } = await this.getActivityAndProgress(userId, taskId);
    const completedProgress = createActivityProgress({
      activityId: taskId,
      status: "completed",
      completedStepIds: activity.steps.map((step) => step.id),
      startedAt: progress.startedAt,
      currentStepId: progress.currentStepId,
      stepAnswers: progress.stepAnswers,
    });

    return this.saveMergedProgress(userId, activity, completedProgress);
  }

  async startActivity(taskId: string, stepId: string): Promise<Task> {
    const userId = this.getCurrentUserId();
    const { activity, progress } = await this.getActivityAndProgress(userId, taskId);

    const nextProgress = createActivityProgress({
      ...progress,
      startedAt: progress.startedAt ?? new Date().toISOString(),
      currentStepId: stepId,
    });

    return this.saveMergedProgress(userId, activity, nextProgress);
  }

  async completeStep(
    taskId: string,
    stepId: string,
    payload?: StepCompletionPayload,
  ): Promise<Task> {
    const userId = this.getCurrentUserId();
    const { activity, progress } = await this.getActivityAndProgress(userId, taskId);

    const completedStepIds = [...new Set([...progress.completedStepIds, stepId])];
    const stepAnswers = { ...progress.stepAnswers };

    if (payload?.answer) {
      stepAnswers[stepId] = payload.answer;
    }

    const allCompleted = activity.steps.every((step) => completedStepIds.includes(step.id));

    const nextProgress = createActivityProgress({
      activityId: taskId,
      status: allCompleted ? "completed" : "active",
      completedStepIds,
      startedAt: progress.startedAt ?? new Date().toISOString(),
      currentStepId: stepId,
      stepAnswers,
    });

    return this.saveMergedProgress(userId, activity, nextProgress);
  }

  async updateCurrentStep(taskId: string, stepId: string): Promise<Task> {
    const userId = this.getCurrentUserId();
    const { activity, progress } = await this.getActivityAndProgress(userId, taskId);

    const nextProgress = createActivityProgress({
      ...progress,
      startedAt: progress.startedAt ?? new Date().toISOString(),
      currentStepId: stepId,
    });

    return this.saveMergedProgress(userId, activity, nextProgress);
  }

  async resetActivity(taskId: string): Promise<Task> {
    const userId = this.getCurrentUserId();
    const { activity } = await this.getActivityAndProgress(userId, taskId);
    const resetProgress = createDefaultActivityProgress(taskId);

    return this.saveMergedProgress(userId, activity, resetProgress);
  }
}
