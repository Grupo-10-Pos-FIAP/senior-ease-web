import type { AccessibilityPreferences } from "@domain/entities/AccessibilityPreferences";
import type { IPreferencesRepository } from "@domain/repositories/IPreferencesRepository";
import { getFirestoreDb } from "@infrastructure/firebase/client";
import {
  fromPreferencesDto,
  toPreferencesDto,
  type PreferencesDto,
} from "@infrastructure/mappers/preferences.mapper";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export class FirestorePreferencesRepository implements IPreferencesRepository {
  async get(userId: string): Promise<AccessibilityPreferences> {
    const snapshot = await getDoc(doc(getFirestoreDb(), "users", userId));

    if (!snapshot.exists()) {
      throw new Error(`Usuário não encontrado: ${userId}`);
    }

    const data = snapshot.data();
    const preferences = data.preferences as PreferencesDto | undefined;

    if (!preferences) {
      throw new Error(`Preferências não encontradas para: ${userId}`);
    }

    return fromPreferencesDto(preferences);
  }

  async update(
    userId: string,
    preferences: AccessibilityPreferences,
  ): Promise<AccessibilityPreferences> {
    const userRef = doc(getFirestoreDb(), "users", userId);
    await updateDoc(userRef, {
      preferences: toPreferencesDto(preferences),
    });
    return preferences;
  }
}
