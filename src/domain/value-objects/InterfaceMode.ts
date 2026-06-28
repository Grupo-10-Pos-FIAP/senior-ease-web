import { InvalidPreferenceError } from "@domain/errors/InvalidPreferenceError";

export type InterfaceMode = "standard" | "simplified";

const VALID_MODES: readonly InterfaceMode[] = ["standard", "simplified"];

export function isInterfaceMode(value: unknown): value is InterfaceMode {
  return typeof value === "string" && VALID_MODES.includes(value as InterfaceMode);
}

export function createInterfaceMode(value: unknown): InterfaceMode {
  if (!isInterfaceMode(value)) {
    throw new InvalidPreferenceError(`Modo de interface inválido: ${String(value)}`);
  }
  return value;
}
