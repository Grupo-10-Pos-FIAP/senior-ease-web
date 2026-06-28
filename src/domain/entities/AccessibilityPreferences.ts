import { createContrastLevel, type ContrastLevel } from "@domain/value-objects/ContrastLevel";
import { createFontSizeLevel, type FontSizeLevel } from "@domain/value-objects/FontSizeLevel";
import { createInterfaceMode, type InterfaceMode } from "@domain/value-objects/InterfaceMode";
import { createSpacingLevel, type SpacingLevel } from "@domain/value-objects/SpacingLevel";

export interface AccessibilityPreferences {
  fontSize: FontSizeLevel;
  contrast: ContrastLevel;
  spacing: SpacingLevel;
  interfaceMode: InterfaceMode;
  reinforcedVisualFeedback: boolean;
  confirmCriticalActions: boolean;
}

export function createDefaultPreferences(): AccessibilityPreferences {
  return {
    fontSize: 3,
    contrast: 3,
    spacing: 3,
    interfaceMode: "standard",
    reinforcedVisualFeedback: true,
    confirmCriticalActions: true,
  };
}

export function createAccessibilityPreferences(
  input: Partial<AccessibilityPreferences>,
): AccessibilityPreferences {
  const defaults = createDefaultPreferences();

  return {
    fontSize: createFontSizeLevel(input.fontSize ?? defaults.fontSize),
    contrast: createContrastLevel(input.contrast ?? defaults.contrast),
    spacing: createSpacingLevel(input.spacing ?? defaults.spacing),
    interfaceMode: createInterfaceMode(input.interfaceMode ?? defaults.interfaceMode),
    reinforcedVisualFeedback: input.reinforcedVisualFeedback ?? defaults.reinforcedVisualFeedback,
    confirmCriticalActions: input.confirmCriticalActions ?? defaults.confirmCriticalActions,
  };
}

export function arePreferencesEqual(
  a: AccessibilityPreferences,
  b: AccessibilityPreferences,
): boolean {
  return (
    a.fontSize === b.fontSize &&
    a.contrast === b.contrast &&
    a.spacing === b.spacing &&
    a.interfaceMode === b.interfaceMode &&
    a.reinforcedVisualFeedback === b.reinforcedVisualFeedback &&
    a.confirmCriticalActions === b.confirmCriticalActions
  );
}
