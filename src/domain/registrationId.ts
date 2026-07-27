/** Prefixo amigável das matrículas SeniorEase (ex.: SE00001). */
const PREFIX = "SE";
const DIGITS = 5;
const MAX = 10 ** DIGITS - 1;
const PATTERN = new RegExp(`^${PREFIX}\\d{${String(DIGITS)}}$`, "i");

/** Documento Firestore do contador sequencial de matrículas. */
export const REGISTRATION_COUNTER_COLLECTION = "counters";
export const REGISTRATION_COUNTER_DOC = "matriculas";

export function isFriendlyRegistrationId(value: string): boolean {
  return PATTERN.test(value.trim());
}

/**
 * Formata o número sequencial do contador Firestore em matrícula amigável.
 * Ex.: 1 → "SE00001"
 */
export function formatRegistrationId(sequence: number): string {
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > MAX) {
    throw new Error(
      `Número de matrícula fora do intervalo permitido (1–${String(MAX)}): ${String(sequence)}`,
    );
  }

  return `${PREFIX}${String(sequence).padStart(DIGITS, "0")}`;
}

/**
 * Normaliza matrícula persistida na leitura.
 * Mantém apenas o formato SE + 5 dígitos; valores inválidos/legados viram string vazia
 * (a alocação sequencial ocorre na camada de infraestrutura).
 */
export function normalizeRegistrationId(value: unknown): string {
  if (typeof value === "string" && isFriendlyRegistrationId(value)) {
    return value.trim().toUpperCase();
  }
  return "";
}
