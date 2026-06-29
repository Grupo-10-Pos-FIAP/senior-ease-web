import { describe, expect, it } from "vitest";
import { createActivity } from "@domain/entities/Activity";
import { createActivityProgress } from "@domain/entities/ActivityProgress";
import { mergeActivityWithProgress } from "./mergeActivityWithProgress";

describe("mergeActivityWithProgress", () => {
  const activity = createActivity({
    id: "task-1",
    title: "Atividade demo",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    status: "active",
    steps: [
      { id: "step-1", label: "Leitura", type: "content_reading", order: 1 },
      { id: "step-2", label: "Quiz", type: "multiple_choice", order: 2 },
    ],
  });

  it("mantém atividade ativa quando o catálogo e o progresso estão ativos", () => {
    const task = mergeActivityWithProgress(
      activity,
      createActivityProgress({ activityId: "task-1", completedStepIds: ["step-1"] }),
    );

    expect(task.status).toBe("active");
    expect(task.steps[0]?.completed).toBe(true);
    expect(task.steps[1]?.completed).toBe(false);
  });

  it("prioriza concluída do usuário sobre expirada do catálogo", () => {
    const expiredActivity = createActivity({ ...activity, status: "expired" });
    const task = mergeActivityWithProgress(
      expiredActivity,
      createActivityProgress({
        activityId: "task-1",
        status: "completed",
        completedStepIds: ["step-1", "step-2"],
      }),
    );

    expect(task.status).toBe("completed");
  });

  it("marca como expirada quando o catálogo expirou e o usuário não concluiu", () => {
    const expiredActivity = createActivity({ ...activity, status: "expired" });
    const task = mergeActivityWithProgress(
      expiredActivity,
      createActivityProgress({ activityId: "task-1" }),
    );

    expect(task.status).toBe("expired");
  });
});
