export type UserActivityStatus = "active" | "completed";

export interface ActivityProgress {
  activityId: string;
  status: UserActivityStatus;
  completedStepIds: string[];
  startedAt?: string;
  currentStepId?: string;
  stepAnswers?: Record<string, string>;
}

const USER_ACTIVITY_STATUSES: UserActivityStatus[] = ["active", "completed"];

export function createActivityProgress(input: {
  activityId: string;
  status?: UserActivityStatus;
  completedStepIds?: string[];
  startedAt?: string;
  currentStepId?: string;
  stepAnswers?: Record<string, string>;
}): ActivityProgress {
  const status = input.status ?? "active";

  if (!USER_ACTIVITY_STATUSES.includes(status)) {
    throw new Error("Status de progresso inválido");
  }

  const completedStepIds = [...new Set(input.completedStepIds ?? [])];
  const stepAnswers = input.stepAnswers ? { ...input.stepAnswers } : undefined;

  return {
    activityId: input.activityId,
    status,
    completedStepIds,
    startedAt: input.startedAt,
    currentStepId: input.currentStepId,
    stepAnswers,
  };
}

export function createDefaultActivityProgress(activityId: string): ActivityProgress {
  return createActivityProgress({ activityId });
}
