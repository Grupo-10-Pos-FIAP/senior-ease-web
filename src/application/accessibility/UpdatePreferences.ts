import {
  createAccessibilityPreferences,
  type AccessibilityPreferences,
} from "@domain/entities/AccessibilityPreferences";
import type { IPreferencesRepository } from "@domain/repositories/IPreferencesRepository";

export class UpdatePreferences {
  constructor(private readonly repository: IPreferencesRepository) {}

  async execute(
    userId: string,
    input: Partial<AccessibilityPreferences>,
  ): Promise<AccessibilityPreferences> {
    const preferences = createAccessibilityPreferences(input);
    return this.repository.update(userId, preferences);
  }
}
