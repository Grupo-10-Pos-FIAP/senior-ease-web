import type { AccessibilityPreferences } from '@domain/entities/AccessibilityPreferences'
import type { IPreferencesRepository } from '@domain/repositories/IPreferencesRepository'

export class GetPreferences {
  constructor(private readonly repository: IPreferencesRepository) {}

  async execute(userId: string): Promise<AccessibilityPreferences> {
    return this.repository.get(userId)
  }
}
