import type { AccessibilityPreferences } from '@domain/entities/AccessibilityPreferences'

export interface IPreferencesRepository {
  get(userId: string): Promise<AccessibilityPreferences>
  update(userId: string, preferences: AccessibilityPreferences): Promise<AccessibilityPreferences>
}
