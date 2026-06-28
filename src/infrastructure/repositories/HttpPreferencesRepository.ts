import type { AccessibilityPreferences } from '@domain/entities/AccessibilityPreferences'
import type { IPreferencesRepository } from '@domain/repositories/IPreferencesRepository'
import type { HttpClient } from '@infrastructure/api/HttpClient'
import {
  fromPreferencesDto,
  toPreferencesDto,
  type PreferencesDto,
} from '@infrastructure/mappers/preferences.mapper'

export class HttpPreferencesRepository implements IPreferencesRepository {
  constructor(private readonly httpClient: HttpClient) {}

  async get(userId: string): Promise<AccessibilityPreferences> {
    const dto = await this.httpClient.get<PreferencesDto>(
      `/api/users/${userId}/preferences`,
    )
    return fromPreferencesDto(dto)
  }

  async update(
    userId: string,
    preferences: AccessibilityPreferences,
  ): Promise<AccessibilityPreferences> {
    const dto = await this.httpClient.put<PreferencesDto>(
      `/api/users/${userId}/preferences`,
      toPreferencesDto(preferences),
    )
    return fromPreferencesDto(dto)
  }
}
