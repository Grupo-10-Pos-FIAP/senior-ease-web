import { describe, expect, it } from "vitest";
import { createActivityProgress } from "@domain/entities/ActivityProgress";
import { toActivityProgressDto } from "@infrastructure/mappers/activity.mapper";

describe("toActivityProgressDto", () => {
  it("omite campos opcionais indefinidos para compatibilidade com Firestore", () => {
    const dto = toActivityProgressDto(
      createActivityProgress({
        activityId: "task-1",
        completedGuideStepIds: ["step-1-1"],
      }),
    );

    expect(dto).toEqual({
      activityId: "task-1",
      status: "active",
      completedStepIds: [],
      completedGuideStepIds: ["step-1-1"],
    });
    expect(dto).not.toHaveProperty("startedAt");
    expect(dto).not.toHaveProperty("currentStepId");
    expect(dto).not.toHaveProperty("stepAnswers");
  });

  it("inclui campos opcionais quando definidos", () => {
    const dto = toActivityProgressDto(
      createActivityProgress({
        activityId: "task-1",
        startedAt: "2026-06-30T10:00:00.000Z",
        currentStepId: "step-1-2",
        stepAnswers: { "step-1-2": "resposta" },
      }),
    );

    expect(dto.startedAt).toBe("2026-06-30T10:00:00.000Z");
    expect(dto.currentStepId).toBe("step-1-2");
    expect(dto.stepAnswers).toEqual({ "step-1-2": "resposta" });
  });
});
