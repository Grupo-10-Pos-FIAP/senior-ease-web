import type { Activity } from "@domain/entities/Activity";
import { TaskNotFoundError } from "@domain/errors/TaskNotFoundError";
import type { IActivityCatalogRepository } from "@domain/repositories/IActivityCatalogRepository";
import { getFirestoreDb } from "@infrastructure/firebase/client";
import { fromActivityDto, type ActivityDto } from "@infrastructure/mappers/activity.mapper";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export class FirestoreActivityCatalogRepository implements IActivityCatalogRepository {
  private activitiesCollection(courseId: string) {
    return collection(getFirestoreDb(), "courses", courseId, "activities");
  }

  async listActivities(courseId: string): Promise<Activity[]> {
    const snapshot = await getDocs(this.activitiesCollection(courseId));
    return snapshot.docs.map((activityDoc) => fromActivityDto(activityDoc.data() as ActivityDto));
  }

  async getActivity(courseId: string, activityId: string): Promise<Activity> {
    const snapshot = await getDoc(
      doc(getFirestoreDb(), "courses", courseId, "activities", activityId),
    );

    if (!snapshot.exists()) {
      throw new TaskNotFoundError(activityId);
    }

    return fromActivityDto(snapshot.data() as ActivityDto);
  }
}
