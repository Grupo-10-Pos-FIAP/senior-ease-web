import { InvalidPreferenceError } from '@domain/errors/InvalidPreferenceError'

export type FontSizeLevel = 1 | 2 | 3 | 4 | 5

const VALID_LEVELS: readonly FontSizeLevel[] = [1, 2, 3, 4, 5]

export function isFontSizeLevel(value: unknown): value is FontSizeLevel {
  return typeof value === 'number' && VALID_LEVELS.includes(value as FontSizeLevel)
}

export function createFontSizeLevel(value: unknown): FontSizeLevel {
  if (!isFontSizeLevel(value)) {
    throw new InvalidPreferenceError(`Nível de fonte inválido: ${String(value)}`)
  }
  return value
}
