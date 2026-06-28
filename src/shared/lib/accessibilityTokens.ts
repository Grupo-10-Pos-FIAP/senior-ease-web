import type { AccessibilityPreferences } from '@domain/entities/AccessibilityPreferences'
import type { ContrastLevel } from '@domain/value-objects/ContrastLevel'
import type { InterfaceMode } from '@domain/value-objects/InterfaceMode'
import type { FontSizeLevel } from '@domain/value-objects/FontSizeLevel'
import type { SpacingLevel } from '@domain/value-objects/SpacingLevel'
import { getContrastRatio, WCAG_UI_MIN } from '@shared/lib/contrastMath'

const FONT_SIZE_MAP: Record<FontSizeLevel, string> = {
  1: '0.875rem',
  2: '0.9375rem',
  3: '1rem',
  4: '1.125rem',
  5: '1.25rem',
}

const SPACING_MAP: Record<SpacingLevel, string> = {
  1: '0.5rem',
  2: '0.75rem',
  3: '1rem',
  4: '1.25rem',
  5: '1.5rem',
}

interface ContrastPalette {
  bg: string
  fg: string
  accent: string
  muted: string
  border: string
  textMuted: string
  feedbackSuccessBg: string
  feedbackSuccessFg: string
  feedbackSuccessBorder: string
  feedbackErrorBg: string
  feedbackErrorFg: string
  feedbackErrorBorder: string
}

export interface ContrastTokens extends ContrastPalette {
  /** Anel externo de reforço — border ou fg conforme SC 1.4.11 vs bg e muted. */
  feedbackRing: string
  /** Borda interna em superfícies preenchidas — luminância do fundo. */
  feedbackInset: string
  /** Contorno de foco de teclado — luminância do texto (SC 2.4.7). */
  focusRing: string
}

function pickFeedbackRing(palette: ContrastPalette): string {
  const ringOnMuted = getContrastRatio(palette.border, palette.muted)
  const ringOnBg = getContrastRatio(palette.border, palette.bg)
  if (ringOnMuted >= WCAG_UI_MIN && ringOnBg >= WCAG_UI_MIN) {
    return palette.border
  }
  return palette.fg
}

function withInteractionTokens(palette: ContrastPalette): ContrastTokens {
  return {
    ...palette,
    // SC 1.4.11 — ≥ 3:1 vs fundo e vs surface-muted (SegmentedControl); SC 1.4.1 — distinto do accent
    feedbackRing: pickFeedbackRing(palette),
    feedbackInset: palette.bg,
    // SC 2.4.7 — foco de teclado por luminância do texto
    focusRing: palette.fg,
  }
}

/**
 * Paletas calibradas por luminância relativa (WCAG 2.2):
 * - SC 1.4.3 / 1.4.6 — contraste de texto (AA 4,5:1 / AAA 7:1)
 * - SC 1.4.11 — bordas e componentes de UI (≥ 3:1)
 * - SC 1.4.1 — accent azul no nível 6; links sublinhados nos níveis 5–6 (G183)
 * - SC 1.3.3 — feedback reforçado usa fg/bg, não accent (evita confundir toque com marca)
 * Nível 2: fundo creme anti-glare; Nível 6: tema escuro + azul (evita vermelho/verde como único diferenciador).
 */
const CONTRAST_PALETTES: Record<ContrastLevel, ContrastPalette> = {
  1: {
    bg: '#ffffff',
    fg: '#1a1a1a',
    accent: '#1D2D50',
    muted: '#f4f6f9',
    border: '#949494',
    textMuted: '#5a6478',
    feedbackSuccessBg: '#f4f6f9',
    feedbackSuccessFg: '#1D2D50',
    feedbackSuccessBorder: '#949494',
    feedbackErrorBg: '#fef2f2',
    feedbackErrorFg: '#7f1d1d',
    feedbackErrorBorder: '#fecaca',
  },
  2: {
    bg: '#f5f0e6',
    fg: '#2b2b2b',
    accent: '#2c5282',
    muted: '#ebe4d6',
    border: '#7a7268',
    textMuted: '#4a4a4a',
    feedbackSuccessBg: '#ebe4d6',
    feedbackSuccessFg: '#2c5282',
    feedbackSuccessBorder: '#7a7268',
    feedbackErrorBg: '#fde8e8',
    feedbackErrorFg: '#7f1d1d',
    feedbackErrorBorder: '#f5b8b8',
  },
  3: {
    bg: '#fafafa',
    fg: '#0d0d0d',
    accent: '#1a365d',
    muted: '#f0f0f0',
    border: '#767676',
    textMuted: '#3d3d3d',
    feedbackSuccessBg: '#f0f0f0',
    feedbackSuccessFg: '#1a365d',
    feedbackSuccessBorder: '#767676',
    feedbackErrorBg: '#fef2f2',
    feedbackErrorFg: '#7f1d1d',
    feedbackErrorBorder: '#fecaca',
  },
  4: {
    bg: '#ffffff',
    fg: '#000000',
    accent: '#004080',
    muted: '#f4f6f9',
    border: '#333333',
    textMuted: '#1a1a1a',
    feedbackSuccessBg: '#f4f6f9',
    feedbackSuccessFg: '#004080',
    feedbackSuccessBorder: '#333333',
    feedbackErrorBg: '#fef2f2',
    feedbackErrorFg: '#7f1d1d',
    feedbackErrorBorder: '#333333',
  },
  5: {
    bg: '#ffffff',
    fg: '#000000',
    accent: '#000000',
    muted: '#eeeeee',
    border: '#000000',
    textMuted: '#000000',
    feedbackSuccessBg: '#eeeeee',
    feedbackSuccessFg: '#000000',
    feedbackSuccessBorder: '#000000',
    feedbackErrorBg: '#ffffff',
    feedbackErrorFg: '#000000',
    feedbackErrorBorder: '#000000',
  },
  6: {
    bg: '#121212',
    fg: '#f5f5f5',
    accent: '#58a6ff',
    muted: '#1e1e1e',
    border: '#888888',
    textMuted: '#d0d0d0',
    feedbackSuccessBg: '#1e1e1e',
    feedbackSuccessFg: '#58a6ff',
    feedbackSuccessBorder: '#888888',
    feedbackErrorBg: '#3b1212',
    feedbackErrorFg: '#fecaca',
    feedbackErrorBorder: '#f87171',
  },
}

const CONTRAST_MAP: Record<ContrastLevel, ContrastTokens> = {
  1: withInteractionTokens(CONTRAST_PALETTES[1]),
  2: withInteractionTokens(CONTRAST_PALETTES[2]),
  3: withInteractionTokens(CONTRAST_PALETTES[3]),
  4: withInteractionTokens(CONTRAST_PALETTES[4]),
  5: withInteractionTokens(CONTRAST_PALETTES[5]),
  6: withInteractionTokens(CONTRAST_PALETTES[6]),
}

const CONTRAST_DESCRIPTIONS: Record<ContrastLevel, string> = {
  1: 'Contraste padrão para uso diário.',
  2: 'Fundo suave com menos reflexo — indicado para sensibilidade à luz ou embassamento.',
  3: 'Leitura mais confortável para vista cansada ou idade avançada.',
  4: 'Alto contraste entre texto e fundo.',
  5: 'Contraste máximo para baixa visão.',
  6: 'Alto contraste em tema escuro — indicado para daltonismo e baixa visão. Links e botões usam azul, não apenas cor.',
}

export function getContrastPalette(level: ContrastLevel): Readonly<ContrastTokens> {
  return CONTRAST_MAP[level]
}

export function getContrastLevelDescription(level: ContrastLevel): string {
  return CONTRAST_DESCRIPTIONS[level]
}

export function applyAccessibilityTokens(
  preferences: AccessibilityPreferences,
  target: HTMLElement = document.documentElement,
): void {
  const contrast = CONTRAST_MAP[preferences.contrast]

  target.style.setProperty('--se-font-size', FONT_SIZE_MAP[preferences.fontSize])
  target.style.setProperty('--se-spacing', SPACING_MAP[preferences.spacing])
  target.style.setProperty('--se-contrast-bg', contrast.bg)
  target.style.setProperty('--se-contrast-fg', contrast.fg)
  target.style.setProperty('--se-surface', contrast.bg)
  target.style.setProperty('--se-accent', contrast.accent)
  target.style.setProperty('--se-navy', contrast.accent)
  target.style.setProperty('--se-surface-muted', contrast.muted)
  target.style.setProperty('--se-focus-ring', contrast.focusRing)
  target.style.setProperty('--se-feedback-ring', contrast.feedbackRing)
  target.style.setProperty('--se-feedback-inset', contrast.feedbackInset)
  target.style.setProperty('--se-border', contrast.border)
  target.style.setProperty('--se-text-muted', contrast.textMuted)
  target.style.setProperty('--se-feedback-success-bg', contrast.feedbackSuccessBg)
  target.style.setProperty('--se-feedback-success-fg', contrast.feedbackSuccessFg)
  target.style.setProperty('--se-feedback-success-border', contrast.feedbackSuccessBorder)
  target.style.setProperty('--se-feedback-error-bg', contrast.feedbackErrorBg)
  target.style.setProperty('--se-feedback-error-fg', contrast.feedbackErrorFg)
  target.style.setProperty('--se-feedback-error-border', contrast.feedbackErrorBorder)

  target.dataset.interfaceMode =
    preferences.interfaceMode === 'simplified' ? 'basic' : 'standard'
  target.dataset.reinforcedFeedback = String(preferences.reinforcedVisualFeedback)
  target.dataset.contrastLevel = String(preferences.contrast)
}

export function getInterfaceModeLabel(mode: InterfaceMode): string {
  return mode === 'standard' ? 'Avançado' : 'Básico'
}
