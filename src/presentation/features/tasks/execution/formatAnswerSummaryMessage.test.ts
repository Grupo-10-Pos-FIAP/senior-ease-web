import { describe, expect, it } from "vitest";
import { formatAnswerSummaryMessage } from "@presentation/features/tasks/execution/formatAnswerSummaryMessage";

describe("formatAnswerSummaryMessage", () => {
  it("celebra quando todas as respostas estão corretas", () => {
    expect(formatAnswerSummaryMessage({ total: 1, correct: 1, incorrect: 0 })).toBe(
      "Parabéns! Você foi muito bem. Continue assim!",
    );
    expect(formatAnswerSummaryMessage({ total: 3, correct: 3, incorrect: 0 })).toBe(
      "Parabéns! Você respondeu todas as 3 perguntas corretamente. Continue assim!",
    );
  });

  it("encoraja o aprendizado no singular sem contar erros nem sugerir repetição", () => {
    const message = formatAnswerSummaryMessage({ total: 1, correct: 0, incorrect: 1 });
    expect(message).toBe("Veja abaixo como foi a pergunta. O importante é aprender.");
    expect(message).not.toMatch(/cada pergunta/i);
    expect(message).not.toMatch(/próxima vez/i);
    expect(message).not.toMatch(/errou/i);
  });

  it("encoraja o aprendizado no plural sem contar erros", () => {
    const message = formatAnswerSummaryMessage({ total: 2, correct: 0, incorrect: 2 });
    expect(message).toBe("Veja abaixo como foram as perguntas. O importante é aprender.");
    expect(message).not.toMatch(/errou/i);
    expect(message).not.toMatch(/acertou 0/i);
  });
});
