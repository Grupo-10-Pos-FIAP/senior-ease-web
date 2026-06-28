import { createContext, useContext } from 'react'
import type { AccessibilityPreferences } from '@domain/entities/AccessibilityPreferences'

export interface AccessibilityContextValue {
  preferences: AccessibilityPreferences
  isLoading: boolean
  applyPreview: (preferences: AccessibilityPreferences) => void
  clearPreview: () => void
}

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null)

export function useAccessibility(): AccessibilityContextValue {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility deve ser usado dentro de AccessibilityProvider')
  }
  return context
}
