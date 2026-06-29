import { describe, expect, it } from "vitest";
import {
  ACTIVITY_CATALOG_SEED,
  applyCatalogExpiration,
  resolveCatalogStatusByEndDate,
} from "@infrastructure/seed/activityCatalog.seed";

describe("activityCatalog.seed", () => {
  it("expira atividades com prazo vencido no catálogo", () => {
    const referenceDate = new Date("2026-06-29T12:00:00");

    expect(resolveCatalogStatusByEndDate("2026-06-29", referenceDate)).toBe("active");
    expect(resolveCatalogStatusByEndDate("2026-06-28", referenceDate)).toBe("expired");

    const activities = applyCatalogExpiration(ACTIVITY_CATALOG_SEED, referenceDate);
    const expiredIds = activities
      .filter((activity) => activity.status === "expired")
      .map((activity) => activity.id);

    expect(expiredIds).toEqual(expect.arrayContaining(["task-5", "task-6", "task-7", "task-8"]));
  });
});
