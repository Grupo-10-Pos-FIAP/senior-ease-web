import { readFileSync } from "node:fs";
import { initializeApp, cert, getApps, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { DEFAULT_COURSE_ID } from "../src/domain/constants/course.ts";
import { syncCourseCatalog } from "./sync-course-catalog.mts";

interface ResetOptions {
  wipeActivities: boolean;
  resetProgress: boolean;
}

interface ResetSummary {
  activitiesDeleted: number;
  progressDocumentsDeleted: number;
  syncSummary: Awaited<ReturnType<typeof syncCourseCatalog>>;
}

function parseArgs(argv: string[]): ResetOptions {
  return {
    wipeActivities: argv.includes("--wipe-activities"),
    resetProgress: argv.includes("--reset-progress"),
  };
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
        "Defina FIREBASE_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS para executar o reset.",
      );
    }
  }

  return getFirestore();
}

async function wipeCourseActivities(firestore: Firestore): Promise<number> {
  const activitiesRef = firestore.collection(`courses/${DEFAULT_COURSE_ID}/activities`);
  const snapshot = await activitiesRef.get();

  if (snapshot.empty) {
    return 0;
  }

  const batch = firestore.batch();
  snapshot.docs.forEach((activityDoc) => {
    batch.delete(activityDoc.ref);
  });
  await batch.commit();

  return snapshot.size;
}

async function wipeAllUserProgress(firestore: Firestore): Promise<number> {
  const usersSnapshot = await firestore.collection("users").get();
  let deleted = 0;

  for (const userDoc of usersSnapshot.docs) {
    const progressSnapshot = await firestore
      .collection(`users/${userDoc.id}/activityProgress`)
      .get();

    if (progressSnapshot.empty) {
      continue;
    }

    const batch = firestore.batch();
    progressSnapshot.docs.forEach((progressDoc) => {
      batch.delete(progressDoc.ref);
    });
    await batch.commit();
    deleted += progressSnapshot.size;
  }

  return deleted;
}

export async function resetCourseCatalog(options: ResetOptions): Promise<ResetSummary> {
  const firestore = initializeAdminApp();

  let activitiesDeleted = 0;
  let progressDocumentsDeleted = 0;

  if (options.wipeActivities) {
    activitiesDeleted = await wipeCourseActivities(firestore);
  }

  if (options.resetProgress) {
    progressDocumentsDeleted = await wipeAllUserProgress(firestore);
  }

  const syncSummary = await syncCourseCatalog();

  return {
    activitiesDeleted,
    progressDocumentsDeleted,
    syncSummary,
  };
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.wipeActivities && !options.resetProgress) {
    console.log(
      "[SeniorEase] Nenhuma flag de limpeza informada. Executando apenas o sync do catálogo.",
    );
    console.log("Use --wipe-activities para apagar atividades antes do sync.");
    console.log("Use --reset-progress para apagar o progresso de todos os usuários.");
  }

  const summary = await resetCourseCatalog(options);

  console.log("[SeniorEase] Reset do catálogo concluído:");
  if (options.wipeActivities) {
    console.log(`- Atividades removidas: ${summary.activitiesDeleted}`);
  }
  if (options.resetProgress) {
    console.log(`- Documentos de progresso removidos: ${summary.progressDocumentsDeleted}`);
  }
  console.log(`- Atividades sincronizadas: ${summary.syncSummary.activitiesUpserted}`);
  console.log(`- Atividades expiradas no catálogo: ${summary.syncSummary.activitiesExpired}`);
  console.log(`- Usuários processados: ${summary.syncSummary.usersProcessed}`);
  console.log(`- Documentos de progresso criados: ${summary.syncSummary.progressDocumentsCreated}`);
}

main().catch((error: unknown) => {
  console.error("[SeniorEase] Falha ao resetar catálogo:", error);
  process.exitCode = 1;
});
