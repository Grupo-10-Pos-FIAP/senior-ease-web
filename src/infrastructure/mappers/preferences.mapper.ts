import {
  createAccessibilityPreferences,
  type AccessibilityPreferences,
} from "@domain/entities/AccessibilityPreferences";
import type { ContrastLevel } from "@domain/value-objects/ContrastLevel";
import type { FontSizeLevel } from "@domain/value-objects/FontSizeLevel";
import type { InterfaceMode } from "@domain/value-objects/InterfaceMode";
import type { SpacingLevel } from "@domain/value-objects/SpacingLevel";

export interface PreferencesDto {
  fontSize: number;
  contrast: number;
  spacing: number;
  interfaceMode: string;
  reinforcedVisualFeedback: boolean;
  confirmCriticalActions: boolean;
}

export function toPreferencesDto(preferences: AccessibilityPreferences): PreferencesDto {
  return {
    fontSize: preferences.fontSize,
    contrast: preferences.contrast,
    spacing: preferences.spacing,
    interfaceMode: preferences.interfaceMode,
    reinforcedVisualFeedback: preferences.reinforcedVisualFeedback,
    confirmCriticalActions: preferences.confirmCriticalActions,
  };
}

export function fromPreferencesDto(dto: PreferencesDto): AccessibilityPreferences {
  return createAccessibilityPreferences({
    fontSize: dto.fontSize as FontSizeLevel,
    contrast: dto.contrast as ContrastLevel,
    spacing: dto.spacing as SpacingLevel,
    interfaceMode: dto.interfaceMode as InterfaceMode,
    reinforcedVisualFeedback: dto.reinforcedVisualFeedback,
    confirmCriticalActions: dto.confirmCriticalActions,
  });
}
