/**
 * WCAG 2.x relative luminance and contrast ratio (SC 1.4.3, 1.4.6, 1.4.11).
 * @see https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum
 */

function channelToLinear(channel: number): number {
  const normalized = channel / 255
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4)
}

function parseHexColor(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  if (value.length !== 6) {
    throw new Error(`Cor hex inválida: ${hex}`)
  }
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = parseHexColor(hex)
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  )
}

export function getContrastRatio(foreground: string, background: string): number {
  const fgLum = getRelativeLuminance(foreground)
  const bgLum = getRelativeLuminance(background)
  const lighter = Math.max(fgLum, bgLum)
  const darker = Math.min(fgLum, bgLum)
  return (lighter + 0.05) / (darker + 0.05)
}

/** WCAG 2.2 SC 1.4.3 — texto normal (AA). */
export const WCAG_TEXT_AA = 4.5

/** WCAG 2.2 SC 1.4.6 — texto normal (AAA). */
export const WCAG_TEXT_AAA = 7

/** WCAG 2.2 SC 1.4.11 — componentes de UI e bordas. */
export const WCAG_UI_MIN = 3
