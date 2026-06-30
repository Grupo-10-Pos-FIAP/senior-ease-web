import type { Activity } from "@domain/entities/Activity";
import type { ActivityProgress } from "@domain/entities/ActivityProgress";
import { createDefaultActivityProgress } from "@domain/entities/ActivityProgress";
import { createTask, type Task, type TaskStatus } from "@domain/entities/Task";

export function resolveMergedTaskStatus(
  activity: Activity,
  progress: ActivityProgress,
): TaskStatus {
  if (progress.status === "completed") {
    return "completed";
  }

  if (activity.status === "expired") {
    return "expired";
  }

  return "active";
}

export function mergeActivityWithProgress(
  activity: Activity,
  progress: ActivityProgress = createDefaultActivityProgress(activity.id),
): Task {
  const status = resolveMergedTaskStatus(activity, progress);
  const completedStepIds = new Set(progress.completedStepIds);
  const completedGuideStepIds = new Set(progress.completedGuideStepIds);
  const guideCompleted =
    activity.steps.length > 0 && activity.steps.every((step) => completedGuideStepIds.has(step.id));

  return createTask({
    id: activity.id,
    title: activity.title,
    startDate: activity.startDate,
    endDate: activity.endDate,
    status,
    guideCompleted,
    startedAt: progress.startedAt,
    currentStepId: progress.currentStepId,
    steps: activity.steps.map((step) => ({
      id: step.id,
      label: step.label,
      type: step.type,
      order: step.order,
      content: step.content,
      completed: completedStepIds.has(step.id),
      answer: progress.stepAnswers?.[step.id],
    })),
  });
}
