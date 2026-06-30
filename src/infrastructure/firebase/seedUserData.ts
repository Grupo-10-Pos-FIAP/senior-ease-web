import { DEFAULT_COURSE_ID } from "@domain/constants/course";
import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import { getFirestoreDb } from "@infrastructure/firebase/client";
import { ageToBirthDate } from "@infrastructure/mappers/user.mapper";
import { toPreferencesDto } from "@infrastructure/mappers/preferences.mapper";
import type { ActivityDto, ActivityProgressDto } from "@infrastructure/mappers/activity.mapper";
import {
  applyCatalogExpiration,
  buildDefaultProgressForCatalog,
  cloneActivityCatalogSeed,
  DEFAULT_COURSE_SEED,
  getDemoProgressForUser,
} from "@infrastructure/seed/activityCatalog.seed";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";

export interface UserDocument {
  id: string;
  fullName: string;
  birthDate: string;
  registrationId: string;
  disability: string | null;
  email: string;
  phone: string;
  preferences: ReturnType<typeof toPreferencesDto>;
  enrolledCourseId: string;
}

/** Em produção, o catálogo é gerenciado pelo script Admin / Firebase Console. */
export function isTaskSeedSyncEnabled(): boolean {
  return !import.meta.env.PROD;
}

function cloneCatalogSeed(): ActivityDto[] {
  return cloneActivityCatalogSeed(new Date());
}

function activityDtoEquals(left: ActivityDto, right: ActivityDto): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function progressDtoEquals(left: ActivityProgressDto, right: ActivityProgressDto): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function mergeProgressFromSeed(
  existing: ActivityProgressDto,
  seed: ActivityProgressDto,
): ActivityProgressDto {
  return {
    activityId: existing.activityId,
    status: existing.status,
    completedStepIds:
      existing.completedStepIds.length > 0
        ? [...existing.completedStepIds]
        : [...seed.completedStepIds],
    completedGuideStepIds:
      (existing.completedGuideStepIds?.length ?? 0) > 0
        ? [...(existing.completedGuideStepIds ?? [])]
        : [...(seed.completedGuideStepIds ?? [])],
    startedAt: existing.startedAt ?? seed.startedAt,
    currentStepId: existing.currentStepId ?? seed.currentStepId,
    stepAnswers: existing.stepAnswers ?? seed.stepAnswers,
  };
}

async function syncCourseCatalog(firestore: Firestore): Promise<void> {
  const courseRef = doc(firestore, "courses", DEFAULT_COURSE_ID);
  const activitiesRef = collection(firestore, "courses", DEFAULT_COURSE_ID, "activities");
  const snapshot = await getDocs(activitiesRef);
  const existingById = new Map(
    snapshot.docs.map((activityDoc) => [activityDoc.id, activityDoc.data() as ActivityDto]),
  );

  const batch = writeBatch(firestore);

  batch.set(courseRef, DEFAULT_COURSE_SEED, { merge: true });

  for (const seedActivity of cloneCatalogSeed()) {
    const existing = existingById.get(seedActivity.id);

    if (!existing) {
      batch.set(doc(activitiesRef, seedActivity.id), seedActivity);
      continue;
    }

    if (!activityDtoEquals(existing, seedActivity)) {
      batch.set(doc(activitiesRef, seedActivity.id), seedActivity);
    }
  }

  await batch.commit();
}

async function listCatalogActivityIds(firestore: Firestore): Promise<string[]> {
  const snapshot = await getDocs(collection(firestore, "courses", DEFAULT_COURSE_ID, "activities"));
  return snapshot.docs.map((activityDoc) => activityDoc.id);
}

async function syncActivityProgressForUser(
  firestore: Firestore,
  uid: string,
  seedProgress: ActivityProgressDto[] = [],
): Promise<void> {
  const activityIds = await listCatalogActivityIds(firestore);
  if (activityIds.length === 0) {
    return;
  }

  const progressRef = collection(firestore, "users", uid, "activityProgress");
  const snapshot = await getDocs(progressRef);
  const existingById = new Map(
    snapshot.docs.map((progressDoc) => [progressDoc.id, progressDoc.data() as ActivityProgressDto]),
  );

  const seedById = new Map(seedProgress.map((progress) => [progress.activityId, progress]));
  const mergedProgress = buildDefaultProgressForCatalog(
    activityIds,
    activityIds.map((activityId) => {
      const existing = existingById.get(activityId);
      const seed = seedById.get(activityId);

      if (existing && seed) {
        return mergeProgressFromSeed(existing, seed);
      }

      if (existing) {
        return existing;
      }

      if (seed) {
        return seed;
      }

      return {
        activityId,
        status: "active" as const,
        completedStepIds: [],
        completedGuideStepIds: [],
      };
    }),
  );

  const batch = writeBatch(firestore);
  let hasChanges = false;

  for (const progress of mergedProgress) {
    const existing = existingById.get(progress.activityId);
    if (!existing || !progressDtoEquals(existing, progress)) {
      batch.set(doc(progressRef, progress.activityId), progress);
      hasChanges = true;
    }
  }

  if (hasChanges) {
    await batch.commit();
  }
}

function createNewUserDocument(uid: string, email: string | null): UserDocument {
  return {
    id: uid,
    fullName: "Complete seu perfil",
    birthDate: "",
    registrationId: "-",
    disability: null,
    email: email ?? "",
    phone: "",
    preferences: toPreferencesDto(createDefaultPreferences()),
    enrolledCourseId: DEFAULT_COURSE_ID,
  };
}

async function migrateLegacyUserDocument(
  userRef: ReturnType<typeof doc>,
  data: Record<string, unknown>,
): Promise<void> {
  const patch: Record<string, unknown> = {};

  if (!data.birthDate && typeof data.age === "number") {
    patch.birthDate = ageToBirthDate(data.age);
    patch.age = deleteField();
  }

  if (data.phone === "-") {
    patch.phone = "";
  }

  if (!data.enrolledCourseId) {
    patch.enrolledCourseId = DEFAULT_COURSE_ID;
  }

  const isIncompleteProfile =
    data.fullName === "Complete seu perfil" || data.registrationId === "-";

  if (data.birthDate === "1960-01-01" && isIncompleteProfile) {
    patch.birthDate = "";
  }

  if (Object.keys(patch).length === 0) {
    return;
  }

  await updateDoc(userRef, patch);
}

export async function ensureUserDocument(uid: string, email: string | null): Promise<void> {
  const firestore = getFirestoreDb();
  const userRef = doc(firestore, "users", uid);
  const snapshot = await getDoc(userRef);
  const seedProgress = isTaskSeedSyncEnabled() ? getDemoProgressForUser(uid) : [];

  if (snapshot.exists()) {
    await migrateLegacyUserDocument(userRef, snapshot.data());

    if (isTaskSeedSyncEnabled()) {
      await syncCourseCatalog(firestore);
    }

    await syncActivityProgressForUser(firestore, uid, seedProgress);
    return;
  }

  const batch = writeBatch(firestore);
  batch.set(userRef, createNewUserDocument(uid, email));
  await batch.commit();

  if (isTaskSeedSyncEnabled()) {
    await syncCourseCatalog(firestore);
  }

  await syncActivityProgressForUser(firestore, uid, seedProgress);
}

export async function deleteUserActivityProgress(firestore: Firestore, uid: string): Promise<void> {
  const progressSnapshot = await getDocs(collection(firestore, "users", uid, "activityProgress"));

  if (progressSnapshot.empty) {
    return;
  }

  const batch = writeBatch(firestore);
  progressSnapshot.docs.forEach((progressDoc) => {
    batch.delete(progressDoc.ref);
  });
  await batch.commit();
}

export async function deleteUserLearningData(firestore: Firestore, uid: string): Promise<void> {
  await deleteUserActivityProgress(firestore, uid);
}

export async function syncCourseCatalogForDev(firestore: Firestore): Promise<void> {
  await syncCourseCatalog(firestore);
}

export { applyCatalogExpiration, cloneActivityCatalogSeed };
