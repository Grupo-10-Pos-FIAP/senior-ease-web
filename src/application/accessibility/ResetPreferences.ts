import {
  createDefaultPreferences,
  type AccessibilityPreferences,
} from "@domain/entities/AccessibilityPreferences";
import type { IPreferencesRepository } from "@domain/repositories/IPreferencesRepository";

export class ResetPreferences {
  constructor(private readonly repository: IPreferencesRepository) {}

  async execute(userId: string): Promise<AccessibilityPreferences> {
    const defaults = createDefaultPreferences();
    return this.repository.update(userId, defaults);
  }
}
