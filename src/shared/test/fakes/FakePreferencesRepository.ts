import type { AccessibilityPreferences } from '@domain/entities/AccessibilityPreferences'
import type { IPreferencesRepository } from '@domain/repositories/IPreferencesRepository'

export class FakePreferencesRepository implements IPreferencesRepository {
  private store = new Map<string, AccessibilityPreferences>()

  constructor(initial?: AccessibilityPreferences) {
    if (initial) {
      this.store.set('demo-user', initial)
    }
  }

  async get(userId: string): Promise<AccessibilityPreferences> {
    const prefs = this.store.get(userId)
    if (!prefs) {
      throw new Error(`Preferências não encontradas para ${userId}`)
    }
    return prefs
  }

  async update(
    userId: string,
    preferences: AccessibilityPreferences,
  ): Promise<AccessibilityPreferences> {
    this.store.set(userId, preferences)
    return preferences
  }
}
