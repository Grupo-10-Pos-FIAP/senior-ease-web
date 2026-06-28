import {
  createAccessibilityPreferences,
  createDefaultPreferences,
  type AccessibilityPreferences,
} from "@domain/entities/AccessibilityPreferences";
import type { IPreferencesRepository } from "@domain/repositories/IPreferencesRepository";

const STORAGE_PREFIX = "seniorease:preferences:";

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export class LocalStoragePreferencesRepository implements IPreferencesRepository {
  get(userId: string): Promise<AccessibilityPreferences> {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) {
      return Promise.resolve(createDefaultPreferences());
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      return Promise.resolve(
        createAccessibilityPreferences(parsed as Partial<AccessibilityPreferences>),
      );
    } catch {
      return Promise.resolve(createDefaultPreferences());
    }
  }

  update(userId: string, preferences: AccessibilityPreferences): Promise<AccessibilityPreferences> {
    localStorage.setItem(storageKey(userId), JSON.stringify(preferences));
    return Promise.resolve(preferences);
  }
}
