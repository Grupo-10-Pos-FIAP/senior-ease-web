export type UserActivityStatus = "active" | "completed";

export interface ActivityProgress {
  activityId: string;
  status: UserActivityStatus;
  completedStepIds: string[];
}

const USER_ACTIVITY_STATUSES: UserActivityStatus[] = ["active", "completed"];

export function createActivityProgress(input: {
  activityId: string;
  status?: UserActivityStatus;
  completedStepIds?: string[];
}): ActivityProgress {
  const status = input.status ?? "active";

  if (!USER_ACTIVITY_STATUSES.includes(status)) {
    throw new Error("Status de progresso inválido");
  }

  const completedStepIds = [...new Set(input.completedStepIds ?? [])];

  return {
    activityId: input.activityId,
    status,
    completedStepIds,
  };
}

export function createDefaultActivityProgress(activityId: string): ActivityProgress {
  return createActivityProgress({ activityId });
}
