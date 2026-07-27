import { describe, expect, it } from "vitest";
import {
  getActivityAnswerResults,
  summarizeActivityAnswers,
} from "@domain/entities/activityAnswerResults";
import { createTask } from "@domain/entities/Task";
import { isMultipleChoiceAnswerCorrect } from "@domain/value-objects/ActivityStepContent";

describe("isMultipleChoiceAnswerCorrect", () => {
  const content = {
    kind: "multiple_choice" as const,
    question: "Qual opção?",
    options: [
      { id: "a", label: "Errada" },
      { id: "b", label: "Certa" },
      { id: "c", label: "Outra errada" },
    ],
    correctOptionId: "b",
  };

  it("marca como correta quando a resposta bate com o gabarito", () => {
    expect(isMultipleChoiceAnswerCorrect(content, "b")).toBe(true);
  });

  it("marca como incorreta quando a resposta é outra opção", () => {
    expect(isMultipleChoiceAnswerCorrect(content, "a")).toBe(false);
  });

  it("marca como incorreta sem resposta", () => {
    expect(isMultipleChoiceAnswerCorrect(content, undefined)).toBe(false);
    expect(isMultipleChoiceAnswerCorrect(content, "")).toBe(false);
  });
});

describe("activityAnswerResults", () => {
  const task = createTask({
    id: "task-1",
    title: "Atividade",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    status: "completed",
    steps: [
      {
        id: "step-reading",
        label: "Leitura",
        type: "content_reading",
        completed: true,
        order: 1,
        content: { kind: "content_reading", body: "Texto" },
      },
      {
        id: "step-mc-1",
        label: "Quiz 1",
        type: "multiple_choice",
        completed: true,
        order: 2,
        answer: "c",
        content: {
          kind: "multiple_choice",
          question: "Pergunta um?",
          options: [
            { id: "a", label: "Opção A" },
            { id: "b", label: "Opção B" },
            { id: "c", label: "Opção C correta" },
          ],
          correctOptionId: "c",
        },
      },
      {
        id: "step-mc-2",
        label: "Quiz 2",
        type: "multiple_choice",
        completed: true,
        order: 3,
        answer: "a",
        content: {
          kind: "multiple_choice",
          question: "Pergunta dois?",
          options: [
            { id: "a", label: "Escolha errada" },
            { id: "b", label: "Escolha certa" },
          ],
          correctOptionId: "b",
        },
      },
      {
        id: "step-open",
        label: "Aberta",
        type: "open_question",
        completed: true,
        order: 4,
        answer: "Minha reflexão longa",
        content: { kind: "open_question", question: "O que aprendeu?" },
      },
    ],
  });

  it("avalia só múltipla escolha e resolve labels", () => {
    const results = getActivityAnswerResults(task);

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      stepId: "step-mc-1",
      question: "Pergunta um?",
      userAnswerLabel: "Opção C correta",
      correctOptionLabel: "Opção C correta",
      isCorrect: true,
    });
    expect(results[1]).toMatchObject({
      stepId: "step-mc-2",
      question: "Pergunta dois?",
      userAnswerLabel: "Escolha errada",
      correctOptionLabel: "Escolha certa",
      isCorrect: false,
    });
  });

  it("resume acertos e erros", () => {
    expect(summarizeActivityAnswers(getActivityAnswerResults(task))).toEqual({
      total: 2,
      correct: 1,
      incorrect: 1,
    });
  });
});
