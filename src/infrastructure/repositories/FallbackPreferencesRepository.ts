import type { AccessibilityPreferences } from '@domain/entities/AccessibilityPreferences'
import type { IPreferencesRepository } from '@domain/repositories/IPreferencesRepository'

export class FallbackPreferencesRepository implements IPreferencesRepository {
  constructor(
    private readonly primary: IPreferencesRepository,
    private readonly fallback: IPreferencesRepository,
  ) {}

  async get(userId: string): Promise<AccessibilityPreferences> {
    try {
      const preferences = await this.primary.get(userId)
      await this.fallback.update(userId, preferences)
      return preferences
    } catch {
      return this.fallback.get(userId)
    }
  }

  async update(
    userId: string,
    preferences: AccessibilityPreferences,
  ): Promise<AccessibilityPreferences> {
    try {
      const result = await this.primary.update(userId, preferences)
      await this.fallback.update(userId, result)
      return result
    } catch {
      return this.fallback.update(userId, preferences)
    }
  }
}
