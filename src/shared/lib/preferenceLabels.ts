import type { ContrastLevel } from "@domain/value-objects/ContrastLevel";
import type { FontSizeLevel } from "@domain/value-objects/FontSizeLevel";
import type { SpacingLevel } from "@domain/value-objects/SpacingLevel";

export interface PreferenceOption<T extends string | number> {
  value: T;
  label: string;
  ariaLabel: string;
}

const FONT_SIZE_LABELS: Record<FontSizeLevel, { label: string; ariaLabel: string }> = {
  1: { label: "Pequena", ariaLabel: "Letra pequena" },
  2: { label: "Reduzida", ariaLabel: "Letra um pouco menor que o normal" },
  3: { label: "Normal", ariaLabel: "Letra em tamanho normal" },
  4: { label: "Grande", ariaLabel: "Letra grande" },
  5: { label: "Muito grande", ariaLabel: "Letra muito grande" },
};

const SPACING_LABELS: Record<SpacingLevel, { label: string; ariaLabel: string }> = {
  1: { label: "Compacto", ariaLabel: "Espaçamento compacto entre elementos" },
  2: { label: "Reduzido", ariaLabel: "Espaçamento um pouco menor que o normal" },
  3: { label: "Normal", ariaLabel: "Espaçamento normal entre elementos" },
  4: { label: "Amplo", ariaLabel: "Espaçamento amplo entre elementos" },
  5: { label: "Muito amplo", ariaLabel: "Espaçamento muito amplo entre elementos" },
};

const CONTRAST_SHORT_LABELS: Record<ContrastLevel, string> = {
  1: "Padrão",
  2: "Suave",
  3: "Conforto",
  4: "Alto",
  5: "Máximo",
  6: "Escuro",
};

function toOptions<T extends string | number>(
  entries: [T, { label: string; ariaLabel: string }][],
): PreferenceOption<T>[] {
  return entries.map(([value, { label, ariaLabel }]) => ({ value, label, ariaLabel }));
}

export function getFontSizeOptions(): PreferenceOption<FontSizeLevel>[] {
  return toOptions(
    (Object.entries(FONT_SIZE_LABELS) as [string, { label: string; ariaLabel: string }][]).map(
      ([key, labels]) => [Number(key) as FontSizeLevel, labels],
    ),
  );
}

export function getSpacingOptions(): PreferenceOption<SpacingLevel>[] {
  return toOptions(
    (Object.entries(SPACING_LABELS) as [string, { label: string; ariaLabel: string }][]).map(
      ([key, labels]) => [Number(key) as SpacingLevel, labels],
    ),
  );
}

export function getContrastOptions(): PreferenceOption<ContrastLevel>[] {
  return ([1, 2, 3, 4, 5, 6] as const).map((level) => ({
    value: level,
    label: CONTRAST_SHORT_LABELS[level],
    ariaLabel: `Nível ${String(level)} — ${CONTRAST_SHORT_LABELS[level]}`,
  }));
}

export type YesNoValue = "sim" | "nao";

export const YES_NO_OPTIONS: PreferenceOption<YesNoValue>[] = [
  { value: "sim", label: "Sim", ariaLabel: "Sim" },
  { value: "nao", label: "Não", ariaLabel: "Não" },
];

export function booleanToYesNo(value: boolean): YesNoValue {
  return value ? "sim" : "nao";
}

export function yesNoToBoolean(value: YesNoValue): boolean {
  return value === "sim";
}

export const PREFERENCE_DESCRIPTIONS = {
  fontSize: "Deixe o texto no tamanho mais confortável para ler.",
  contrast:
    "Ajuste a diferença entre texto e fundo. A descrição do nível escolhido aparece abaixo.",
  interfaceMode:
    "No modo básico, a plataforma oferece mais orientações e textos didáticos.\nJá no modo avançado, a interface fica mais enxuta, com menos ajuda na tela.",
  spacing: "Aumente o espaço entre botões e blocos se tiver dificuldade para tocar.",
  reinforcedVisualFeedback:
    "Destaca botões e foco com contornos mais visíveis ao tocar ou navegar.",
  confirmCriticalActions: "Pede confirmação antes de ações importantes, como sair da conta.",
} as const;

export const PANEL_INTRO =
  "Ajuste como a plataforma aparece para você. As mudanças são mostradas na hora; toque em Salvar para guardar.";
