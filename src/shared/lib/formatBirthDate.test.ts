import { describe, expect, it } from "vitest";
import {
  birthDateDisplayToIso,
  formatBirthDateMask,
  isoToBirthDateDisplay,
} from "@shared/lib/formatBirthDate";

describe("formatBirthDate", () => {
  it("converte ISO para exibição brasileira", () => {
    expect(isoToBirthDateDisplay("1959-01-15")).toBe("15/01/1959");
  });

  it("aplica máscara DD/MM/AAAA", () => {
    expect(formatBirthDateMask("15011959")).toBe("15/01/1959");
    expect(formatBirthDateMask("15/01/1959")).toBe("15/01/1959");
  });

  it("converte exibição para ISO", () => {
    expect(birthDateDisplayToIso("15/01/1959")).toBe("1959-01-15");
    expect(birthDateDisplayToIso("15/01")).toBeNull();
  });
});
