import { InvalidPreferenceError } from "@domain/errors/InvalidPreferenceError";

export type ContrastLevel = 1 | 2 | 3 | 4 | 5 | 6;

const VALID_LEVELS: readonly ContrastLevel[] = [1, 2, 3, 4, 5, 6];

export function isContrastLevel(value: unknown): value is ContrastLevel {
  return typeof value === "number" && VALID_LEVELS.includes(value as ContrastLevel);
}

export function createContrastLevel(value: unknown): ContrastLevel {
  if (!isContrastLevel(value)) {
    throw new InvalidPreferenceError(`Nível de contraste inválido: ${String(value)}`);
  }
  return value;
}
