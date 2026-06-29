import type { ActivityProgress } from "@domain/entities/ActivityProgress";

export interface IActivityProgressRepository {
  listProgress(userId: string): Promise<ActivityProgress[]>;
  getProgress(userId: string, activityId: string): Promise<ActivityProgress | null>;
  saveProgress(userId: string, progress: ActivityProgress): Promise<ActivityProgress>;
  initDefaultProgress(
    userId: string,
    activityIds: string[],
    existing?: ActivityProgress[],
  ): Promise<ActivityProgress[]>;
}
