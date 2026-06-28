import { useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { createDefaultPreferences } from '@domain/entities/AccessibilityPreferences'
import type { AccessibilityPreferences } from '@domain/entities/AccessibilityPreferences'
import { usePreferencesQuery } from '@app/hooks/usePreferences'
import { applyAccessibilityTokens } from '@shared/lib/accessibilityTokens'
import { AccessibilityContext } from '@app/providers/accessibilityContext'

interface AccessibilityProviderProps {
  children: ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const { data, isLoading } = usePreferencesQuery()
  const preferences = data ?? createDefaultPreferences()

  useEffect(() => {
    applyAccessibilityTokens(preferences)
  }, [preferences])

  const applyPreview = useCallback((preview: AccessibilityPreferences) => {
    applyAccessibilityTokens(preview)
  }, [])

  const clearPreview = useCallback(() => {
    applyAccessibilityTokens(preferences)
  }, [preferences])

  const value = useMemo(
    () => ({
      preferences,
      isLoading,
      applyPreview,
      clearPreview,
    }),
    [preferences, isLoading, applyPreview, clearPreview],
  )

  return (
    <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
  )
}
