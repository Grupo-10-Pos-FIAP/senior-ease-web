import { afterEach, describe, expect, it, vi } from "vitest";
import { isTaskSeedSyncEnabled } from "./seedUserData";

describe("isTaskSeedSyncEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("habilita seed em desenvolvimento", () => {
    vi.stubEnv("PROD", false);
    vi.stubEnv("DEV", true);

    expect(isTaskSeedSyncEnabled()).toBe(true);
  });

  it("desabilita seed em produção", () => {
    vi.stubEnv("PROD", true);
    vi.stubEnv("DEV", false);

    expect(isTaskSeedSyncEnabled()).toBe(false);
  });
});
