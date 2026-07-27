import type { ActivityAnswerSummary } from "@domain/entities/activityAnswerResults";

/** Resumo encorajador: destaca o aprendizado, não a contagem de erros. */
export function formatAnswerSummaryMessage(summary: ActivityAnswerSummary): string {
  if (summary.incorrect === 0) {
    return summary.total === 1
      ? "Parabéns! Você foi muito bem. Continue assim!"
      : `Parabéns! Você respondeu todas as ${String(summary.total)} perguntas corretamente. Continue assim!`;
  }

  return summary.total === 1
    ? "Veja abaixo como foi a pergunta. O importante é aprender."
    : "Veja abaixo como foram as perguntas. O importante é aprender.";
}
