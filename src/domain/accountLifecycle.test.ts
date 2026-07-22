import { describe, expect, it } from "vitest";
import {
  ACCOUNT_DEACTIVATION_RETENTION_DAYS,
  computePurgeAt,
  createDeactivatedLifecycle,
  isAccountDeactivated,
  isAccountPurgeDue,
  normalizeAccountLifecycle,
} from "@domain/accountLifecycle";

describe("accountLifecycle", () => {
  it("calcula purgeAt com 90 dias a partir da desativação", () => {
    expect(computePurgeAt("2026-01-01T00:00:00.000Z")).toBe("2026-04-01T00:00:00.000Z");
    expect(ACCOUNT_DEACTIVATION_RETENTION_DAYS).toBe(90);
  });

  it("cria lifecycle desativado e detecta vencimento", () => {
    const lifecycle = createDeactivatedLifecycle(new Date("2026-01-01T00:00:00.000Z"));

    expect(isAccountDeactivated(lifecycle)).toBe(true);
    expect(isAccountPurgeDue(lifecycle, new Date("2026-03-31T23:59:59.000Z"))).toBe(false);
    expect(isAccountPurgeDue(lifecycle, new Date("2026-04-01T00:00:00.000Z"))).toBe(true);
  });

  it("normaliza documentos legados sem status para active", () => {
    expect(normalizeAccountLifecycle({})).toEqual({
      accountStatus: "active",
      deactivatedAt: null,
      purgeAt: null,
    });
  });
});
