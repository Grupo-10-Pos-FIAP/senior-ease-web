import { DEFAULT_COURSE_ID } from "@domain/constants/course";
import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import { normalizeRegistrationId } from "@domain/registrationId";
import { getFirestoreDb } from "@infrastructure/firebase/client";
import { ageToBirthDate } from "@infrastructure/mappers/user.mapper";
import { toPreferencesDto } from "@infrastructure/mappers/preferences.mapper";
import type { ActivityProgressDto } from "@infrastructure/mappers/activity.mapper";
import {
  ACTIVITY_CATALOG_SEED,
  applyCatalogExpiration,
  buildDefaultProgressForCatalog,
  cloneActivityCatalogSeed,
  getDemoProgressForUser,
} from "@infrastructure/seed/activityCatalog.seed";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  setDoc,
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
  accountStatus: "active" | "deactivated";
  deactivatedAt: string | null;
  purgeAt: string | null;
}

/** Em produção, o catálogo é gerenciado pelo script Admin / Firebase Console. */
export function isTaskSeedSyncEnabled(): boolean {
  return !import.meta.env.PROD;
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

async function listCatalogActivityIds(firestore: Firestore): Promise<string[]> {
  if (isTaskSeedSyncEnabled()) {
    return ACTIVITY_CATALOG_SEED.map((activity) => activity.id);
  }

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
    registrationId: normalizeRegistrationId(null, uid),
    disability: null,
    email: email ?? "",
    phone: "",
    preferences: toPreferencesDto(createDefaultPreferences()),
    enrolledCourseId: DEFAULT_COURSE_ID,
    accountStatus: "active",
    deactivatedAt: null,
    purgeAt: null,
  };
}

async function migrateLegacyUserDocument(
  userRef: ReturnType<typeof doc>,
  data: Record<string, unknown>,
): Promise<void> {
  const patch: Record<string, unknown> = {};
  const uid = typeof data.id === "string" && data.id ? data.id : userRef.id;
  const registrationId = normalizeRegistrationId(data.registrationId, uid);

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

  if (data.registrationId !== registrationId) {
    patch.registrationId = registrationId;
  }

  const isIncompleteProfile =
    data.fullName === "Complete seu perfil" || data.registrationId === "-";

  if (data.birthDate === "1960-01-01" && isIncompleteProfile) {
    patch.birthDate = "";
  }

  if (data.accountStatus !== "active" && data.accountStatus !== "deactivated") {
    patch.accountStatus = "active";
    patch.deactivatedAt = null;
    patch.purgeAt = null;
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
    await syncActivityProgressForUser(firestore, uid, seedProgress);
    return;
  }

  await setDoc(userRef, createNewUserDocument(uid, email));
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

export { applyCatalogExpiration, cloneActivityCatalogSeed };
