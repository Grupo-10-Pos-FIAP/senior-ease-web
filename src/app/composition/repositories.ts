import { httpClient } from "@app/composition/httpClient";
import { getCurrentAuthUser } from "@infrastructure/firebase/authService";
import { FallbackPreferencesRepository } from "@infrastructure/repositories/FallbackPreferencesRepository";
import { FirestorePreferencesRepository } from "@infrastructure/repositories/FirestorePreferencesRepository";
import { FirestoreTaskRepository } from "@infrastructure/repositories/FirestoreTaskRepository";
import { FirestoreUserRepository } from "@infrastructure/repositories/FirestoreUserRepository";
import { HttpPreferencesRepository } from "@infrastructure/repositories/HttpPreferencesRepository";
import { HttpTaskRepository } from "@infrastructure/repositories/HttpTaskRepository";
import { HttpUserRepository } from "@infrastructure/repositories/HttpUserRepository";
import { LocalStoragePreferencesRepository } from "@infrastructure/repositories/LocalStoragePreferencesRepository";

const isTestEnv = import.meta.env.MODE === "test";

function getCurrentUserId(): string {
  const user = getCurrentAuthUser();
  if (!user) {
    return "demo-user";
  }
  return user.uid;
}

function createRepositories() {
  if (isTestEnv) {
    const httpPreferencesRepository = new HttpPreferencesRepository(httpClient);
    const localPreferencesRepository = new LocalStoragePreferencesRepository();

    return {
      preferencesRepository: new FallbackPreferencesRepository(
        httpPreferencesRepository,
        localPreferencesRepository,
      ),
      taskRepository: new HttpTaskRepository(httpClient),
      userRepository: new HttpUserRepository(httpClient),
    };
  }

  return {
    preferencesRepository: new FirestorePreferencesRepository(),
    taskRepository: new FirestoreTaskRepository(getCurrentUserId),
    userRepository: new FirestoreUserRepository(),
  };
}

const repositories = createRepositories();

export const preferencesRepository = repositories.preferencesRepository;
export const taskRepository = repositories.taskRepository;
export const userRepository = repositories.userRepository;
