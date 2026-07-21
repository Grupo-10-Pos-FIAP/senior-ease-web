import type { Activity } from "@domain/entities/Activity";
import { TaskNotFoundError } from "@domain/errors/TaskNotFoundError";
import type { IActivityCatalogRepository } from "@domain/repositories/IActivityCatalogRepository";
import { isTaskSeedSyncEnabled } from "@infrastructure/firebase/seedUserData";
import { getFirestoreDb } from "@infrastructure/firebase/client";
import { fromActivityDto, type ActivityDto } from "@infrastructure/mappers/activity.mapper";
import { cloneActivityCatalogSeed } from "@infrastructure/seed/activityCatalog.seed";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

/** Em DEV o catálogo vem do seed local (Firestore bloqueia escrita no catálogo remoto). */
export class FirestoreActivityCatalogRepository implements IActivityCatalogRepository {
  private activitiesCollection(courseId: string) {
    return collection(getFirestoreDb(), "courses", courseId, "activities");
  }

  private listSeedActivities(): Activity[] {
    return cloneActivityCatalogSeed(new Date()).map((activity) => fromActivityDto(activity));
  }

  async listActivities(_courseId: string): Promise<Activity[]> {
    if (isTaskSeedSyncEnabled()) {
      return this.listSeedActivities();
    }

    const snapshot = await getDocs(this.activitiesCollection(_courseId));
    return snapshot.docs.map((activityDoc) => fromActivityDto(activityDoc.data() as ActivityDto));
  }

  async getActivity(courseId: string, activityId: string): Promise<Activity> {
    if (isTaskSeedSyncEnabled()) {
      const activity = this.listSeedActivities().find((item) => item.id === activityId);
      if (!activity) {
        throw new TaskNotFoundError(activityId);
      }
      return activity;
    }

    const snapshot = await getDoc(
      doc(getFirestoreDb(), "courses", courseId, "activities", activityId),
    );

    if (!snapshot.exists()) {
      throw new TaskNotFoundError(activityId);
    }

    return fromActivityDto(snapshot.data() as ActivityDto);
  }
}
