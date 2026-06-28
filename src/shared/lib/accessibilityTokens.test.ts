import { describe, expect, it } from "vitest";
import type { ContrastLevel } from "@domain/value-objects/ContrastLevel";
import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import {
  applyAccessibilityTokens,
  getContrastLevelDescription,
  getContrastPalette,
} from "@shared/lib/accessibilityTokens";
import {
  getContrastRatio,
  WCAG_TEXT_AA,
  WCAG_TEXT_AAA,
  WCAG_UI_MIN,
} from "@shared/lib/contrastMath";

const ALL_LEVELS: ContrastLevel[] = [1, 2, 3, 4, 5, 6];

describe("accessibilityTokens — contraste", () => {
  it("descreve os 6 níveis em português", () => {
    expect(getContrastLevelDescription(1)).toMatch(/padrão/i);
    expect(getContrastLevelDescription(2)).toMatch(/reflexo|embassamento/i);
    expect(getContrastLevelDescription(6)).toMatch(/daltonismo/i);
    expect(getContrastLevelDescription(6)).toMatch(/tema escuro/i);
  });

  it("aplica tokens do nível 6 (daltonismo e baixa visão)", () => {
    const target = document.documentElement;
    applyAccessibilityTokens({ ...createDefaultPreferences(), contrast: 6 }, target);

    expect(target.style.getPropertyValue("--se-contrast-bg")).toBe("#121212");
    expect(target.style.getPropertyValue("--se-surface")).toBe("#121212");
    expect(target.style.getPropertyValue("--se-accent")).toBe("#58a6ff");
    expect(target.style.getPropertyValue("--se-focus-ring")).toBe("#f5f5f5");
    expect(target.style.getPropertyValue("--se-feedback-ring")).toBe("#888888");
    expect(target.style.getPropertyValue("--se-feedback-inset")).toBe("#121212");
    expect(target.dataset.contrastLevel).toBe("6");
  });

  it("aplica tokens de feedback e foco por luminância no nível 1", () => {
    const target = document.documentElement;
    applyAccessibilityTokens({ ...createDefaultPreferences(), contrast: 1 }, target);

    expect(target.style.getPropertyValue("--se-focus-ring")).toBe("#1a1a1a");
    expect(target.style.getPropertyValue("--se-feedback-ring")).toBe("#1a1a1a");
    expect(target.style.getPropertyValue("--se-feedback-inset")).toBe("#ffffff");
  });

  it("aplica fundo suave no nível 2 (anti-reflexo)", () => {
    const target = document.documentElement;
    applyAccessibilityTokens({ ...createDefaultPreferences(), contrast: 2 }, target);

    expect(target.style.getPropertyValue("--se-contrast-bg")).toBe("#f5f0e6");
  });
});

describe("accessibilityTokens — ratios WCAG", () => {
  it.each(ALL_LEVELS)("nível %i: borda atinge SC 1.4.11 (≥ 3:1)", (level) => {
    const { bg, border } = getContrastPalette(level);
    expect(getContrastRatio(border, bg)).toBeGreaterThanOrEqual(WCAG_UI_MIN);
  });

  it.each(ALL_LEVELS)("nível %i: accent atinge SC 1.4.3 (≥ 4,5:1)", (level) => {
    const { bg, accent } = getContrastPalette(level);
    expect(getContrastRatio(accent, bg)).toBeGreaterThanOrEqual(WCAG_TEXT_AA);
  });

  it.each([1, 2] as const)("nível %i: texto atinge AA (≥ 4,5:1)", (level) => {
    const { bg, fg } = getContrastPalette(level);
    expect(getContrastRatio(fg, bg)).toBeGreaterThanOrEqual(WCAG_TEXT_AA);
  });

  it.each([3, 4, 5, 6] as const)("nível %i: texto atinge AAA (≥ 7:1)", (level) => {
    const { bg, fg } = getContrastPalette(level);
    expect(getContrastRatio(fg, bg)).toBeGreaterThanOrEqual(WCAG_TEXT_AAA);
  });

  it.each(ALL_LEVELS)("nível %i: textMuted legível sobre o fundo (≥ 4,5:1)", (level) => {
    const { bg, textMuted } = getContrastPalette(level);
    expect(getContrastRatio(textMuted, bg)).toBeGreaterThanOrEqual(WCAG_TEXT_AA);
  });
});

describe("accessibilityTokens — feedback reforçado WCAG", () => {
  it.each(ALL_LEVELS)("nível %i: feedbackRing atinge SC 1.4.11 sobre o fundo (≥ 3:1)", (level) => {
    const { bg, feedbackRing } = getContrastPalette(level);
    expect(getContrastRatio(feedbackRing, bg)).toBeGreaterThanOrEqual(WCAG_UI_MIN);
  });

  it.each(ALL_LEVELS)("nível %i: focusRing atinge SC 1.4.11 sobre o fundo (≥ 3:1)", (level) => {
    const { bg, focusRing } = getContrastPalette(level);
    expect(getContrastRatio(focusRing, bg)).toBeGreaterThanOrEqual(WCAG_UI_MIN);
  });

  it.each(ALL_LEVELS)(
    "nível %i: feedbackInset visível no botão primário (≥ 3:1 sobre accent)",
    (level) => {
      const { accent, feedbackInset } = getContrastPalette(level);
      expect(getContrastRatio(feedbackInset, accent)).toBeGreaterThanOrEqual(WCAG_UI_MIN);
    },
  );

  it.each([1, 2, 3, 4, 6] as const)(
    "nível %i: feedbackRing distinto do accent (não confundir marca)",
    (level) => {
      const { accent, feedbackRing } = getContrastPalette(level);
      expect(feedbackRing).not.toBe(accent);
    },
  );

  it.each(ALL_LEVELS)(
    "nível %i: feedbackRing visível sobre fundo do SegmentedControl (≥ 3:1)",
    (level) => {
      const { muted, feedbackRing } = getContrastPalette(level);
      expect(getContrastRatio(feedbackRing, muted)).toBeGreaterThanOrEqual(WCAG_UI_MIN);
    },
  );

  it("nível 5: feedbackInset contrasta com accent em paleta monocromática", () => {
    const { accent, feedbackInset } = getContrastPalette(5);
    expect(feedbackInset).not.toBe(accent);
  });
});
