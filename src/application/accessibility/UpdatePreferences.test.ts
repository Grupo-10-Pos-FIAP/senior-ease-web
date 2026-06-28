import { describe, expect, it } from "vitest";
import { UpdatePreferences } from "@application/accessibility/UpdatePreferences";
import { FakePreferencesRepository } from "@shared/test/fakes/FakePreferencesRepository";
import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import { InvalidPreferenceError } from "@domain/errors/InvalidPreferenceError";

describe("UpdatePreferences", () => {
  it("persiste preferências válidas", async () => {
    const repo = new FakePreferencesRepository(createDefaultPreferences());
    const useCase = new UpdatePreferences(repo);

    const result = await useCase.execute("demo-user", { fontSize: 5, contrast: 2 });

    expect(result.fontSize).toBe(5);
    expect(result.contrast).toBe(2);
  });

  it("rejeita valor inválido", async () => {
    const repo = new FakePreferencesRepository(createDefaultPreferences());
    const useCase = new UpdatePreferences(repo);

    await expect(useCase.execute("demo-user", { fontSize: 99 as never })).rejects.toThrow(
      InvalidPreferenceError,
    );
  });
});
