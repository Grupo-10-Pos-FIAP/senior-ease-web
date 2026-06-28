import { InvalidPreferenceError } from '@domain/errors/InvalidPreferenceError'

export type SpacingLevel = 1 | 2 | 3 | 4 | 5

const VALID_LEVELS: readonly SpacingLevel[] = [1, 2, 3, 4, 5]

export function isSpacingLevel(value: unknown): value is SpacingLevel {
  return typeof value === 'number' && VALID_LEVELS.includes(value as SpacingLevel)
}

export function createSpacingLevel(value: unknown): SpacingLevel {
  if (!isSpacingLevel(value)) {
    throw new InvalidPreferenceError(`Nível de espaçamento inválido: ${String(value)}`)
  }
  return value
}
