import { describe, expect, it } from "vitest";
import {
  formatRegistrationId,
  isFriendlyRegistrationId,
  normalizeRegistrationId,
} from "./registrationId";

describe("registrationId", () => {
  it("formata sequência numérica como SE + 5 dígitos", () => {
    expect(formatRegistrationId(1)).toBe("SE00001");
    expect(formatRegistrationId(42)).toBe("SE00042");
    expect(formatRegistrationId(99999)).toBe("SE99999");
  });

  it("rejeita sequência fora do intervalo", () => {
    expect(() => formatRegistrationId(0)).toThrow(/intervalo/i);
    expect(() => formatRegistrationId(100_000)).toThrow(/intervalo/i);
    expect(() => formatRegistrationId(1.5)).toThrow(/intervalo/i);
  });

  it("reconhece matrícula amigável", () => {
    expect(isFriendlyRegistrationId("SE12345")).toBe(true);
    expect(isFriendlyRegistrationId("se00001")).toBe(true);
    expect(isFriendlyRegistrationId("SE999")).toBe(false);
    expect(isFriendlyRegistrationId("-")).toBe(false);
  });

  it("normaliza matrícula SE + 5 dígitos e descarta valores inválidos", () => {
    expect(normalizeRegistrationId("SE12345")).toBe("SE12345");
    expect(normalizeRegistrationId("se00001")).toBe("SE00001");
    expect(normalizeRegistrationId(null)).toBe("");
    expect(normalizeRegistrationId("-")).toBe("");
    expect(normalizeRegistrationId("SE999")).toBe("");
    expect(normalizeRegistrationId("q8uxtuQAjNUOzXGYM2uJ9iXYW6P2")).toBe("");
  });
});
