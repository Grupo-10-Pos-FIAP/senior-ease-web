import { readFileSync } from "node:fs";
import { initializeApp, cert, getApps, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { DEFAULT_COURSE_ID } from "../src/domain/constants/course.ts";
import type {
  ActivityDto,
  ActivityProgressDto,
} from "../src/infrastructure/mappers/activity.mapper.ts";
import {
  ACTIVITY_CATALOG_SEED,
  applyCatalogExpiration,
  buildDefaultProgressForCatalog,
  cloneActivityCatalogSeed,
  DEFAULT_COURSE_SEED,
} from "../src/infrastructure/seed/activityCatalog.seed.ts";

interface SyncSummary {
  activitiesUpserted: number;
  activitiesExpired: number;
  usersProcessed: number;
  progressDocumentsCreated: number;
}

function initializeAdminApp(): Firestore {
  if (getApps().length === 0) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
      initializeApp({
        credential: cert(serviceAccount),
        projectId: projectId ?? serviceAccount.project_id,
      });
    } else if (credentialsPath) {
      const serviceAccount = JSON.parse(readFileSync(credentialsPath, "utf8")) as ServiceAccount;
      initializeApp({
        credential: cert(serviceAccount),
        projectId: projectId ?? serviceAccount.project_id,
      });
    } else {
      throw new Error(
        "Defina FIREBASE_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS para executar o sync.",
      );
    }
  }

  return getFirestore();
}

async function upsertCourseCatalog(
  firestore: Firestore,
  referenceDate: Date,
): Promise<{ activitiesUpserted: number; activitiesExpired: number }> {
  const activities = applyCatalogExpiration(
    cloneActivityCatalogSeed(referenceDate).map((activity) => ({
      ...activity,
      steps: activity.steps.map((step) => ({ ...step })),
    })),
    referenceDate,
  );

  const batch = firestore.batch();
  batch.set(firestore.doc(`courses/${DEFAULT_COURSE_ID}`), DEFAULT_COURSE_SEED, { merge: true });

  for (const activity of activities) {
    batch.set(
      firestore.doc(`courses/${DEFAULT_COURSE_ID}/activities/${activity.id}`),
      activity satisfies ActivityDto,
    );
  }

  await batch.commit();

  return {
    activitiesUpserted: activities.length,
    activitiesExpired: activities.filter((activity) => activity.status === "expired").length,
  };
}

async function ensureUserCourseEnrollment(firestore: Firestore, userId: string): Promise<void> {
  const userRef = firestore.doc(`users/${userId}`);
  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    return;
  }

  const data = snapshot.data();
  if (data?.enrolledCourseId === DEFAULT_COURSE_ID) {
    return;
  }

  await userRef.set({ enrolledCourseId: DEFAULT_COURSE_ID }, { merge: true });
}

async function ensureUserProgress(
  firestore: Firestore,
  userId: string,
  activityIds: string[],
): Promise<number> {
  const progressCollection = firestore.collection(`users/${userId}/activityProgress`);
  const snapshot = await progressCollection.get();
  const existing = snapshot.docs.map((doc) => doc.data() as ActivityProgressDto);
  const merged = buildDefaultProgressForCatalog(activityIds, existing);
  const batch = firestore.batch();
  let created = 0;

  for (const progress of merged) {
    const progressRef = progressCollection.doc(progress.activityId);
    const current = await progressRef.get();

    if (!current.exists) {
      batch.set(progressRef, progress);
      created += 1;
    }
  }

  if (created > 0) {
    await batch.commit();
  }

  return created;
}

export async function syncCourseCatalog(referenceDate = new Date()): Promise<SyncSummary> {
  const firestore = initializeAdminApp();
  const { activitiesUpserted, activitiesExpired } = await upsertCourseCatalog(
    firestore,
    referenceDate,
  );

  const activityIds = ACTIVITY_CATALOG_SEED.map((activity) => activity.id);
  const usersSnapshot = await firestore.collection("users").get();

  let progressDocumentsCreated = 0;

  for (const userDoc of usersSnapshot.docs) {
    await ensureUserCourseEnrollment(firestore, userDoc.id);
    progressDocumentsCreated += await ensureUserProgress(firestore, userDoc.id, activityIds);
  }

  return {
    activitiesUpserted,
    activitiesExpired,
    usersProcessed: usersSnapshot.size,
    progressDocumentsCreated,
  };
}

async function main(): Promise<void> {
  const summary = await syncCourseCatalog();

  console.log("[SeniorEase] Sync do catálogo concluído:");
  console.log(`- Atividades sincronizadas: ${summary.activitiesUpserted}`);
  console.log(`- Atividades expiradas no catálogo: ${summary.activitiesExpired}`);
  console.log(`- Usuários processados: ${summary.usersProcessed}`);
  console.log(`- Documentos de progresso criados: ${summary.progressDocumentsCreated}`);
}

main().catch((error: unknown) => {
  console.error("[SeniorEase] Falha ao sincronizar catálogo:", error);
  process.exitCode = 1;
});
