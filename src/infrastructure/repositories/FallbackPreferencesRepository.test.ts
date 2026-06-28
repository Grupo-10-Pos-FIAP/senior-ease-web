import { describe, expect, it, vi, beforeEach } from "vitest";
import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import type { AccessibilityPreferences } from "@domain/entities/AccessibilityPreferences";
import type { IPreferencesRepository } from "@domain/repositories/IPreferencesRepository";
import { FallbackPreferencesRepository } from "@infrastructure/repositories/FallbackPreferencesRepository";

class InMemoryPreferencesRepository implements IPreferencesRepository {
  private store = new Map<string, AccessibilityPreferences>();

  get(userId: string): Promise<AccessibilityPreferences> {
    return Promise.resolve(this.store.get(userId) ?? createDefaultPreferences());
  }

  update(userId: string, preferences: AccessibilityPreferences): Promise<AccessibilityPreferences> {
    this.store.set(userId, preferences);
    return Promise.resolve(preferences);
  }
}

class FailingPreferencesRepository implements IPreferencesRepository {
  get(): Promise<AccessibilityPreferences> {
    return Promise.reject(new Error("API unavailable"));
  }

  update(): Promise<AccessibilityPreferences> {
    return Promise.reject(new Error("API unavailable"));
  }
}

describe("FallbackPreferencesRepository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("usa fallback quando a API falha no get", async () => {
    const fallback = new InMemoryPreferencesRepository();
    await fallback.update("demo-user", {
      ...createDefaultPreferences(),
      fontSize: 5,
    });

    const repo = new FallbackPreferencesRepository(new FailingPreferencesRepository(), fallback);

    const prefs = await repo.get("demo-user");
    expect(prefs.fontSize).toBe(5);
  });

  it("persiste no fallback quando a API falha no update", async () => {
    const fallback = new InMemoryPreferencesRepository();
    const repo = new FallbackPreferencesRepository(new FailingPreferencesRepository(), fallback);

    const updated = await repo.update("demo-user", {
      ...createDefaultPreferences(),
      contrast: 4,
    });

    expect(updated.contrast).toBe(4);
    expect((await fallback.get("demo-user")).contrast).toBe(4);
  });

  it("sincroniza fallback após get bem-sucedido na API", async () => {
    const primary = new InMemoryPreferencesRepository();
    await primary.update("demo-user", { ...createDefaultPreferences(), spacing: 2 });

    const fallbackGet = vi.fn(async (userId: string) => {
      const repo = new InMemoryPreferencesRepository();
      return repo.get(userId);
    });
    const fallbackUpdate = vi.fn(async (userId: string, prefs: AccessibilityPreferences) => {
      const repo = new InMemoryPreferencesRepository();
      return repo.update(userId, prefs);
    });

    const fallback: IPreferencesRepository = {
      get: fallbackGet,
      update: fallbackUpdate,
    };

    const repo = new FallbackPreferencesRepository(primary, fallback);
    await repo.get("demo-user");

    expect(fallbackUpdate).toHaveBeenCalled();
  });
});
