/**
 * Migra matrículas de alunos existentes para sequência numérica (SE00001, SE00002, …)
 * e inicializa counters/matriculas.current com o último número gerado.
 *
 * Pré-requisitos:
 *   1. service-account.json do projeto Firebase (Console → Project settings → Service accounts)
 *   2. export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
 *   3. (opcional) VITE_FIREBASE_PROJECT_ID no .env — senão usa o project_id da service account
 *
 * Uso:
 *   npm run migrate:registration-ids:dry   # lista o plano (seguro)
 *   npm run migrate:registration-ids       # aplica a migração (execução única)
 *   npm run migrate:registration-ids -- --force  # reaplica mesmo se o contador já existir
 */
import { readFileSync } from "node:fs";
import { initializeApp, cert, getApps, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import {
  formatRegistrationId,
  REGISTRATION_COUNTER_COLLECTION,
  REGISTRATION_COUNTER_DOC,
} from "../src/domain/registrationId.ts";

const FIRESTORE_BATCH_LIMIT = 450;

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
        "Defina FIREBASE_SERVICE_ACCOUNT_JSON ou GOOGLE_APPLICATION_CREDENTIALS para executar a migração.",
      );
    }
  }

  return getFirestore();
}

function counterRef(firestore: Firestore) {
  return firestore.collection(REGISTRATION_COUNTER_COLLECTION).doc(REGISTRATION_COUNTER_DOC);
}

async function assertMigrationAllowed(firestore: Firestore, force: boolean): Promise<void> {
  const snapshot = await counterRef(firestore).get();
  if (!snapshot.exists) {
    return;
  }

  const current = snapshot.data()?.current;
  if (force) {
    console.warn(
      `[SeniorEase] Contador já existe (current=${String(current)}). Continuando por causa de --force.`,
    );
    return;
  }

  throw new Error(
    `Migração abortada: counters/${REGISTRATION_COUNTER_DOC} já existe (current=${String(current)}). ` +
      "Use --force apenas se quiser reatribuir todas as matrículas.",
  );
}

async function commitUserRegistrationBatches(
  firestore: Firestore,
  assignments: Array<{ uid: string; registrationId: string }>,
): Promise<void> {
  for (let index = 0; index < assignments.length; index += FIRESTORE_BATCH_LIMIT) {
    const chunk = assignments.slice(index, index + FIRESTORE_BATCH_LIMIT);
    const batch = firestore.batch();

    for (const assignment of chunk) {
      batch.update(firestore.collection("users").doc(assignment.uid), {
        registrationId: assignment.registrationId,
      });
    }

    await batch.commit();
    console.log(
      `[SeniorEase] Lote ${String(Math.floor(index / FIRESTORE_BATCH_LIMIT) + 1)}: ` +
        `${String(chunk.length)} usuário(s) atualizado(s).`,
    );
  }
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes("--dry-run");
  const force = process.argv.includes("--force");
  const firestore = initializeAdminApp();

  await assertMigrationAllowed(firestore, force);

  const usersSnapshot = await firestore.collection("users").get();
  const sortedUsers = [...usersSnapshot.docs].sort((left, right) =>
    left.id.localeCompare(right.id),
  );

  if (sortedUsers.length === 0) {
    if (dryRun) {
      console.log("[dry-run] Nenhum usuário encontrado. Contador permaneceria em 0 / ausente.");
      return;
    }

    await counterRef(firestore).set({ current: 0 }, { merge: true });
    console.log("[SeniorEase] Nenhum usuário encontrado. Contador inicializado em current=0.");
    return;
  }

  const assignments = sortedUsers.map((userDoc, index) => {
    const sequence = index + 1;
    const previous =
      typeof userDoc.data().registrationId === "string" ? userDoc.data().registrationId : "(vazio)";

    return {
      uid: userDoc.id,
      sequence,
      previousRegistrationId: previous,
      registrationId: formatRegistrationId(sequence),
    };
  });

  const lastSequence = assignments[assignments.length - 1]?.sequence ?? 0;

  if (dryRun) {
    for (const assignment of assignments) {
      console.log(
        `[dry-run] ${assignment.uid}: ${assignment.previousRegistrationId} → ${assignment.registrationId}`,
      );
    }
    console.log(
      `[dry-run] Atualizaria counters/${REGISTRATION_COUNTER_DOC}.current = ${String(lastSequence)} ` +
        `(${String(assignments.length)} usuário(s)).`,
    );
    return;
  }

  await commitUserRegistrationBatches(
    firestore,
    assignments.map(({ uid, registrationId }) => ({ uid, registrationId })),
  );

  await counterRef(firestore).set({ current: lastSequence }, { merge: true });

  console.log(
    `[SeniorEase] Migração concluída. ${String(assignments.length)} matrícula(s) sequencial(is); ` +
      `counters/${REGISTRATION_COUNTER_DOC}.current = ${String(lastSequence)}.`,
  );
}

main().catch((error: unknown) => {
  console.error("[SeniorEase] Falha na migração de matrículas:", error);
  process.exitCode = 1;
});
