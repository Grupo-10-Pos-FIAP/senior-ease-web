import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import { getFirestoreDb } from "@infrastructure/firebase/client";
import { ageToBirthDate } from "@infrastructure/mappers/user.mapper";
import { toPreferencesDto } from "@infrastructure/mappers/preferences.mapper";
import type { TaskDto } from "@infrastructure/mappers/task.mapper";
import { TASK_SEED_DATA } from "@infrastructure/msw/db/tasks.db";
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
}

function cloneSeedTasks(): TaskDto[] {
  return TASK_SEED_DATA.map((task) => ({
    ...task,
    steps: task.steps.map((step) => ({ ...step })),
  }));
}

function mergeTaskFromSeed(existing: TaskDto, seed: TaskDto): TaskDto {
  const completedByStepId = new Map(existing.steps.map((step) => [step.id, step.completed]));

  return {
    ...seed,
    status: existing.status,
    steps: seed.steps.map((step) => ({
      ...step,
      completed: completedByStepId.get(step.id) ?? step.completed,
    })),
  };
}

function taskDtoEquals(left: TaskDto, right: TaskDto): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

async function syncTasksFromSeed(firestore: Firestore, uid: string): Promise<void> {
  const tasksRef = collection(firestore, "users", uid, "tasks");
  const snapshot = await getDocs(tasksRef);
  const existingById = new Map(
    snapshot.docs.map((taskDoc) => [taskDoc.id, taskDoc.data() as TaskDto]),
  );

  const batch = writeBatch(firestore);
  let hasChanges = false;

  for (const seedTask of cloneSeedTasks()) {
    const existing = existingById.get(seedTask.id);

    if (!existing) {
      batch.set(doc(tasksRef, seedTask.id), seedTask);
      hasChanges = true;
      continue;
    }

    const merged = mergeTaskFromSeed(existing, seedTask);
    if (!taskDtoEquals(existing, merged)) {
      batch.set(doc(tasksRef, seedTask.id), merged);
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

  if (snapshot.exists()) {
    await migrateLegacyUserDocument(userRef, snapshot.data());
    await syncTasksFromSeed(firestore, uid);
    return;
  }

  const batch = writeBatch(firestore);
  batch.set(userRef, createNewUserDocument(uid, email));

  for (const task of cloneSeedTasks()) {
    batch.set(doc(collection(firestore, "users", uid, "tasks"), task.id), task);
  }

  await batch.commit();
}

export async function deleteUserTasks(firestore: Firestore, uid: string): Promise<void> {
  const tasksSnapshot = await getDocs(collection(firestore, "users", uid, "tasks"));

  if (tasksSnapshot.empty) {
    return;
  }

  const batch = writeBatch(firestore);
  tasksSnapshot.docs.forEach((taskDoc) => {
    batch.delete(taskDoc.ref);
  });
  await batch.commit();
}
