import { createActivityProgress, type ActivityProgress } from "@domain/entities/ActivityProgress";
import type { IActivityProgressRepository } from "@domain/repositories/IActivityProgressRepository";
import { getFirestoreDb } from "@infrastructure/firebase/client";
import {
  fromActivityProgressDto,
  toActivityProgressDto,
  type ActivityProgressDto,
} from "@infrastructure/mappers/activity.mapper";
import { buildDefaultProgressForCatalog } from "@infrastructure/seed/activityCatalog.seed";
import { collection, doc, getDoc, getDocs, writeBatch } from "firebase/firestore";

export class FirestoreActivityProgressRepository implements IActivityProgressRepository {
  private progressCollection(userId: string) {
    return collection(getFirestoreDb(), "users", userId, "activityProgress");
  }

  async listProgress(userId: string): Promise<ActivityProgress[]> {
    const snapshot = await getDocs(this.progressCollection(userId));
    return snapshot.docs.map((progressDoc) =>
      fromActivityProgressDto(progressDoc.data() as ActivityProgressDto),
    );
  }

  async getProgress(userId: string, activityId: string): Promise<ActivityProgress | null> {
    const snapshot = await getDoc(
      doc(getFirestoreDb(), "users", userId, "activityProgress", activityId),
    );

    if (!snapshot.exists()) {
      return null;
    }

    return fromActivityProgressDto(snapshot.data() as ActivityProgressDto);
  }

  async saveProgress(userId: string, progress: ActivityProgress): Promise<ActivityProgress> {
    const progressRef = doc(
      getFirestoreDb(),
      "users",
      userId,
      "activityProgress",
      progress.activityId,
    );
    const dto = toActivityProgressDto(progress);
    const batch = writeBatch(getFirestoreDb());
    batch.set(progressRef, dto);
    await batch.commit();
    return createActivityProgress(progress);
  }

  async initDefaultProgress(
    userId: string,
    activityIds: string[],
    existing: ActivityProgress[] = [],
  ): Promise<ActivityProgress[]> {
    const progressDtos = buildDefaultProgressForCatalog(
      activityIds,
      existing.map((progress) => toActivityProgressDto(progress)),
    );

    const batch = writeBatch(getFirestoreDb());
    let hasChanges = false;

    for (const progressDto of progressDtos) {
      const progressRef = doc(
        getFirestoreDb(),
        "users",
        userId,
        "activityProgress",
        progressDto.activityId,
      );
      const snapshot = await getDoc(progressRef);

      if (!snapshot.exists()) {
        batch.set(progressRef, progressDto);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await batch.commit();
    }

    return this.listProgress(userId);
  }
}
