/**
 * Purge manual de contas desativadas há 90+ dias (produção ou qualquer projeto Firebase).
 *
 * Pré-requisitos:
 *   1. service-account.json do projeto Firebase (Console → Project settings → Service accounts)
 *   2. export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
 *   3. (opcional) VITE_FIREBASE_PROJECT_ID no .env — senão usa o project_id da service account
 *
 * Uso:
 *   npm run purge:accounts:dry   # lista o que seria apagado (seguro)
 *   npm run purge:accounts       # apaga Auth + Firestore (users/{uid} + activityProgress)
 */
import { readFileSync } from "node:fs";
import { initializeApp, cert, getApps, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { isAccountPurgeDue, normalizeAccountLifecycle } from "../src/domain/accountLifecycle.ts";

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
        "Defina FIREBASE_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS para executar o purge.",
      );
    }
  }

  return getFirestore();
}

async function deleteActivityProgress(firestore: Firestore, uid: string): Promise<void> {
  const progressSnapshot = await firestore
    .collection("users")
    .doc(uid)
    .collection("activityProgress")
    .get();

  if (progressSnapshot.empty) {
    return;
  }

  const batch = firestore.batch();
  progressSnapshot.docs.forEach((progressDoc) => {
    batch.delete(progressDoc.ref);
  });
  await batch.commit();
}

async function purgeUser(firestore: Firestore, uid: string): Promise<void> {
  await deleteActivityProgress(firestore, uid);
  await firestore.collection("users").doc(uid).delete();

  try {
    await getAuth().deleteUser(uid);
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: unknown }).code)
        : "";
    if (code !== "auth/user-not-found") {
      throw error;
    }
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const now = new Date();
  const firestore = initializeAdminApp();

  const snapshot = await firestore
    .collection("users")
    .where("accountStatus", "==", "deactivated")
    .where("purgeAt", "<=", now.toISOString())
    .get();

  let purged = 0;
  let skipped = 0;

  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    const lifecycle = normalizeAccountLifecycle({
      accountStatus: data.accountStatus,
      deactivatedAt: typeof data.deactivatedAt === "string" ? data.deactivatedAt : null,
      purgeAt: typeof data.purgeAt === "string" ? data.purgeAt : null,
    });

    if (!isAccountPurgeDue(lifecycle, now)) {
      skipped += 1;
      continue;
    }

    if (dryRun) {
      console.log(
        `[dry-run] Excluiria permanentemente: ${userDoc.id} (purgeAt=${lifecycle.purgeAt})`,
      );
      purged += 1;
      continue;
    }

    await purgeUser(firestore, userDoc.id);
    console.log(`[SeniorEase] Conta excluída permanentemente: ${userDoc.id}`);
    purged += 1;
  }

  console.log(
    `[SeniorEase] Purge concluído. ${String(purged)} conta(s) processada(s), ${String(skipped)} ignorada(s).`,
  );
}

main().catch((error: unknown) => {
  console.error("[SeniorEase] Falha no purge de contas desativadas:", error);
  process.exitCode = 1;
});
