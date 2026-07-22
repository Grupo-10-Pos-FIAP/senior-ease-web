import { describe, expect, it } from "vitest";
import {
  ACTIVITY_CATALOG_SEED,
  applyCatalogExpiration,
  resolveCatalogStatusByEndDate,
  TASK_MOCK_REFERENCE_DATE,
} from "@infrastructure/seed/activityCatalog.seed";

const EXPIRED_SEED_IDS = ["task-22", "task-23", "task-24", "task-25", "task-26"];

describe("activityCatalog.seed", () => {
  it("inclui cinco atividades marcadas como expiradas no seed", () => {
    const expiredIds = ACTIVITY_CATALOG_SEED.filter(
      (activity) => activity.status === "expired",
    ).map((activity) => activity.id);

    expect(expiredIds).toEqual(EXPIRED_SEED_IDS);
  });

  it("expira atividades com prazo vencido no catálogo", () => {
    const referenceDate = new Date(`${TASK_MOCK_REFERENCE_DATE}T12:00:00`);

    expect(resolveCatalogStatusByEndDate(TASK_MOCK_REFERENCE_DATE, referenceDate)).toBe("active");
    expect(resolveCatalogStatusByEndDate("2026-07-20", referenceDate)).toBe("expired");

    const afterNearTermDeadlines = new Date("2026-09-01T12:00:00");
    const expiredActivities = applyCatalogExpiration(ACTIVITY_CATALOG_SEED, afterNearTermDeadlines);
    const expiredIds = expiredActivities
      .filter((activity) => activity.status === "expired")
      .map((activity) => activity.id);
    const stillActiveIds = expiredActivities
      .filter((activity) => activity.status === "active")
      .map((activity) => activity.id);

    expect(expiredIds).toEqual(
      expect.arrayContaining([
        ...EXPIRED_SEED_IDS,
        "task-1",
        "task-14",
        "task-15",
        "task-16",
        "task-17",
        "task-18",
        "task-19",
        "task-20",
        "task-21",
      ]),
    );
    expect(stillActiveIds).toEqual(expect.arrayContaining(["task-13", "task-8", "task-7"]));
  });

  it("mantém a data máxima de expiração em setembro de 2026", () => {
    const endDates = ACTIVITY_CATALOG_SEED.map((activity) => activity.endDate);
    expect(endDates.every((endDate) => endDate <= "2026-09-30")).toBe(true);
    expect(endDates).toContain("2026-09-30");
  });
});
