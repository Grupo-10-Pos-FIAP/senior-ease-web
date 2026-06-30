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

    const activitiesOnReferenceDate = applyCatalogExpiration(ACTIVITY_CATALOG_SEED, referenceDate);
    expect(activitiesOnReferenceDate.every((activity) => activity.status === "active")).toBe(true);

    const afterAllShortDeadlines = new Date("2026-07-11T12:00:00");
    const expiredActivities = applyCatalogExpiration(ACTIVITY_CATALOG_SEED, afterAllShortDeadlines);
    const expiredIds = expiredActivities
      .filter((activity) => activity.status === "expired")
      .map((activity) => activity.id);

    expect(expiredIds).toEqual(
      expect.arrayContaining([
        "task-1",
        "task-2",
        "task-3",
        "task-4",
        "task-5",
        "task-6",
        "task-7",
        "task-8",
      ]),
    );
  });
});
