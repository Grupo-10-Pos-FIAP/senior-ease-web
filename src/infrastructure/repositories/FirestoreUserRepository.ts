import {
  ACTIVE_ACCOUNT_LIFECYCLE,
  createDeactivatedLifecycle,
  type AccountLifecycle,
} from "@domain/accountLifecycle";
import type { User } from "@domain/entities/User";
import { UserNotFoundError } from "@domain/errors/UserNotFoundError";
import type { IUserRepository, UserUpdateInput } from "@domain/repositories/IUserRepository";
import { deleteAuthUser } from "@infrastructure/firebase/authService";
import { getFirestoreDb } from "@infrastructure/firebase/client";
import { deleteUserLearningData } from "@infrastructure/firebase/seedUserData";
import {
  fromAccountLifecycleDto,
  fromUserDto,
  type UserDto,
} from "@infrastructure/mappers/user.mapper";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";

export class FirestoreUserRepository implements IUserRepository {
  async get(userId: string): Promise<User> {
    const snapshot = await getDoc(doc(getFirestoreDb(), "users", userId));

    if (!snapshot.exists()) {
      throw new UserNotFoundError(userId);
    }

    const data = snapshot.data() as UserDto;
    return fromUserDto({ ...data, id: userId });
  }

  async getAccountLifecycle(userId: string): Promise<AccountLifecycle> {
    const snapshot = await getDoc(doc(getFirestoreDb(), "users", userId));

    if (!snapshot.exists()) {
      throw new UserNotFoundError(userId);
    }

    return fromAccountLifecycleDto(snapshot.data());
  }

  async update(userId: string, input: UserUpdateInput): Promise<User> {
    const userRef = doc(getFirestoreDb(), "users", userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      throw new UserNotFoundError(userId);
    }

    await updateDoc(userRef, input as unknown as Record<string, unknown>);
    const updated = await getDoc(userRef);
    const data = updated.data() as UserDto;
    return fromUserDto({ ...data, id: userId });
  }

  async deactivate(userId: string): Promise<AccountLifecycle> {
    const userRef = doc(getFirestoreDb(), "users", userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      throw new UserNotFoundError(userId);
    }

    const lifecycle = createDeactivatedLifecycle();
    await updateDoc(userRef, {
      accountStatus: lifecycle.accountStatus,
      deactivatedAt: lifecycle.deactivatedAt,
      purgeAt: lifecycle.purgeAt,
    });

    return lifecycle;
  }

  async reactivate(userId: string): Promise<AccountLifecycle> {
    const userRef = doc(getFirestoreDb(), "users", userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      throw new UserNotFoundError(userId);
    }

    await updateDoc(userRef, {
      accountStatus: ACTIVE_ACCOUNT_LIFECYCLE.accountStatus,
      deactivatedAt: null,
      purgeAt: null,
    });

    return ACTIVE_ACCOUNT_LIFECYCLE;
  }

  async delete(userId: string): Promise<void> {
    const firestore = getFirestoreDb();
    const userRef = doc(firestore, "users", userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      throw new UserNotFoundError(userId);
    }

    await deleteUserLearningData(firestore, userId);
    await deleteDoc(userRef);
    await deleteAuthUser();
  }
}
