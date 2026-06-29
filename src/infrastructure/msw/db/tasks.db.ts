import { mergeActivityWithProgress } from "@application/tasks/mergeActivityWithProgress";
import { createDefaultActivityProgress } from "@domain/entities/ActivityProgress";
import {
  fromActivityDto,
  fromActivityProgressDto,
  type ActivityDto,
  type ActivityProgressDto,
} from "@infrastructure/mappers/activity.mapper";
import { toTaskDto, type TaskDto } from "@infrastructure/mappers/task.mapper";
import {
  buildDefaultProgressForCatalog,
  cloneActivityCatalogSeed,
  getDemoProgressForUser,
  TASK_MOCK_REFERENCE_DATE,
} from "@infrastructure/seed/activityCatalog.seed";

export { TASK_MOCK_REFERENCE_DATE };

let catalogDb: ActivityDto[] = cloneActivityCatalogSeed();
const progressDb = new Map<string, ActivityProgressDto[]>();

function getUserProgressList(userId: string): ActivityProgressDto[] {
  if (!progressDb.has(userId)) {
    progressDb.set(userId, getDemoProgressForUser(userId));
  }

  return progressDb.get(userId) ?? [];
}

function setUserProgressList(userId: string, progressList: ActivityProgressDto[]): void {
  progressDb.set(
    userId,
    progressList.map((progress) => ({
      ...progress,
      completedStepIds: [...progress.completedStepIds],
    })),
  );
}

function getMergedTasksForUser(userId = "demo-user"): TaskDto[] {
  const activityIds = catalogDb.map((activity) => activity.id);
  const progressList = buildDefaultProgressForCatalog(activityIds, getUserProgressList(userId));

  return catalogDb.map((activityDto) => {
    const activity = fromActivityDto(activityDto);
    const progressDto = progressList.find((item) => item.activityId === activity.id);
    const progress = progressDto
      ? fromActivityProgressDto(progressDto)
      : createDefaultActivityProgress(activity.id);

    return toTaskDto(mergeActivityWithProgress(activity, progress));
  });
}

export function getCatalogFromDb(): ActivityDto[] {
  return catalogDb.map((activity) => ({
    ...activity,
    steps: activity.steps.map((step) => ({ ...step })),
  }));
}

export function getProgressFromDb(userId: string): ActivityProgressDto[] {
  return getUserProgressList(userId).map((progress) => ({
    ...progress,
    completedStepIds: [...progress.completedStepIds],
  }));
}

export function getTasksFromDb(userId = "demo-user"): TaskDto[] {
  return getMergedTasksForUser(userId);
}

export function getTaskFromDb(id: string, userId = "demo-user"): TaskDto | undefined {
  return getTasksFromDb(userId).find((task) => task.id === id);
}

export function completeTaskInDb(id: string, userId = "demo-user"): TaskDto | undefined {
  const activityDto = catalogDb.find((activity) => activity.id === id);
  if (!activityDto) return undefined;

  const activity = fromActivityDto(activityDto);
  const currentProgressList = getUserProgressList(userId);
  const currentProgress = currentProgressList.find((item) => item.activityId === id);
  const merged = mergeActivityWithProgress(
    activity,
    currentProgress ? fromActivityProgressDto(currentProgress) : createDefaultActivityProgress(id),
  );

  if (merged.status !== "active") {
    return undefined;
  }

  const completedProgress: ActivityProgressDto = {
    activityId: id,
    status: "completed",
    completedStepIds: activity.steps.map((step) => step.id),
  };

  const nextProgress = buildDefaultProgressForCatalog(
    catalogDb.map((activity) => activity.id),
    [...currentProgressList.filter((item) => item.activityId !== id), completedProgress],
  );

  setUserProgressList(userId, nextProgress);
  return getTaskFromDb(id, userId);
}

export function resetTasksDb(): void {
  catalogDb = cloneActivityCatalogSeed();
  progressDb.clear();
}

export function setCatalogInDb(activities: ActivityDto[]): void {
  catalogDb = activities.map((activity) => ({
    ...activity,
    steps: activity.steps.map((step) => ({ ...step })),
  }));
}
