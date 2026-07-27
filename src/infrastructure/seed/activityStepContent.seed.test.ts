import { describe, expect, it } from "vitest";
import { ACTIVITY_CATALOG_SEED } from "@infrastructure/seed/activityCatalog.seed";
import { enrichActivityStepsWithContent } from "@infrastructure/seed/activityStepContent.seed";

describe("activityStepContent.seed gabarito", () => {
  it("define correctOptionId válido em toda múltipla escolha", () => {
    const multipleChoiceSteps = ACTIVITY_CATALOG_SEED.flatMap((activity) =>
      enrichActivityStepsWithContent(activity).steps.filter(
        (step) => step.content?.kind === "multiple_choice",
      ),
    );

    expect(multipleChoiceSteps.length).toBeGreaterThan(0);

    for (const step of multipleChoiceSteps) {
      if (step.content?.kind !== "multiple_choice") {
        continue;
      }

      const optionIds = step.content.options.map((option) => option.id);
      expect(optionIds).toContain(step.content.correctOptionId);
    }
  });

  it("não deixa a resposta correta sempre na opção a", () => {
    const correctIds = ACTIVITY_CATALOG_SEED.flatMap((activity) =>
      enrichActivityStepsWithContent(activity)
        .steps.filter((step) => step.content?.kind === "multiple_choice")
        .map((step) =>
          step.content?.kind === "multiple_choice" ? step.content.correctOptionId : "",
        ),
    );

    const uniqueCorrectIds = new Set(correctIds);
    expect(uniqueCorrectIds.size).toBeGreaterThan(1);
  });
});
