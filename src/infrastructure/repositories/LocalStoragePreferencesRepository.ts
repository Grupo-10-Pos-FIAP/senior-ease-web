import {
  createAccessibilityPreferences,
  createDefaultPreferences,
  type AccessibilityPreferences,
} from '@domain/entities/AccessibilityPreferences'
import type { IPreferencesRepository } from '@domain/repositories/IPreferencesRepository'

const STORAGE_PREFIX = 'seniorease:preferences:'

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`
}

export class LocalStoragePreferencesRepository implements IPreferencesRepository {
  async get(userId: string): Promise<AccessibilityPreferences> {
    const raw = localStorage.getItem(storageKey(userId))
    if (!raw) {
      return createDefaultPreferences()
    }

    try {
      const parsed: unknown = JSON.parse(raw)
      return createAccessibilityPreferences(parsed as Partial<AccessibilityPreferences>)
    } catch {
      return createDefaultPreferences()
    }
  }

  async update(
    userId: string,
    preferences: AccessibilityPreferences,
  ): Promise<AccessibilityPreferences> {
    localStorage.setItem(storageKey(userId), JSON.stringify(preferences))
    return preferences
  }
}
