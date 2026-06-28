import type { PreferencesDto } from "@infrastructure/mappers/preferences.mapper";

const store = new Map<string, PreferencesDto>();

export function seedPreferencesDb(): void {
  store.clear();
  store.set("demo-user", {
    fontSize: 3,
    contrast: 3,
    spacing: 3,
    interfaceMode: "standard",
    reinforcedVisualFeedback: true,
    confirmCriticalActions: true,
  });
}

export function getPreferencesFromDb(userId: string): PreferencesDto | undefined {
  return store.get(userId);
}

export function updatePreferencesInDb(userId: string, dto: PreferencesDto): PreferencesDto {
  store.set(userId, dto);
  return dto;
}

export function resetPreferencesDb(): void {
  seedPreferencesDb();
}

seedPreferencesDb();
