import { describe, expect, it } from 'vitest'
import {
  arePreferencesEqual,
  createAccessibilityPreferences,
  createDefaultPreferences,
} from '@domain/entities/AccessibilityPreferences'
import { InvalidPreferenceError } from '@domain/errors/InvalidPreferenceError'

describe('AccessibilityPreferences', () => {
  it('createDefaultPreferences retorna valores confortáveis', () => {
    const prefs = createDefaultPreferences()

    expect(prefs).toEqual({
      fontSize: 3,
      contrast: 3,
      spacing: 3,
      interfaceMode: 'standard',
      reinforcedVisualFeedback: true,
      confirmCriticalActions: true,
    })
  })

  it('createAccessibilityPreferences valida VOs numéricos', () => {
    const prefs = createAccessibilityPreferences({
      fontSize: 5,
      contrast: 1,
      spacing: 4,
      interfaceMode: 'simplified',
      reinforcedVisualFeedback: false,
      confirmCriticalActions: false,
    })

    expect(prefs.fontSize).toBe(5)
    expect(prefs.interfaceMode).toBe('simplified')
  })

  it('rejeita fontSize inválido', () => {
    expect(() => createAccessibilityPreferences({ fontSize: 6 as never })).toThrow(
      InvalidPreferenceError,
    )
  })

  it('rejeita contrast inválido', () => {
    expect(() => createAccessibilityPreferences({ contrast: 7 as never })).toThrow(
      InvalidPreferenceError,
    )
  })

  it('aceita nível de contraste 6', () => {
    const prefs = createAccessibilityPreferences({ contrast: 6 })
    expect(prefs.contrast).toBe(6)
  })

  it('arePreferencesEqual compara todos os campos', () => {
    const a = createDefaultPreferences()
    const b = createDefaultPreferences()

    expect(arePreferencesEqual(a, b)).toBe(true)
    expect(arePreferencesEqual(a, { ...a, fontSize: 4 })).toBe(false)
  })
})
