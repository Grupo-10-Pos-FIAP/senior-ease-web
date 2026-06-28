import { describe, expect, it } from "vitest";
import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import { fromPreferencesDto, toPreferencesDto } from "@infrastructure/mappers/preferences.mapper";

describe("preferences.mapper", () => {
  it("round-trip DTO ↔ entidade", () => {
    const original = createDefaultPreferences();
    const dto = toPreferencesDto(original);
    const restored = fromPreferencesDto(dto);

    expect(restored).toEqual(original);
  });
});
