import type { Activity } from "@domain/entities/Activity";

export interface IActivityCatalogRepository {
  listActivities(courseId: string): Promise<Activity[]>;
  getActivity(courseId: string, activityId: string): Promise<Activity>;
}
