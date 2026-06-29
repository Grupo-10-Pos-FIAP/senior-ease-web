import { describe, expect, it } from "vitest";
import { mapAuthError } from "@infrastructure/firebase/mapAuthError";

describe("mapAuthError", () => {
  it("traduz código conhecido do Firebase", () => {
    expect(mapAuthError({ code: "auth/wrong-password" })).toBe("Senha incorreta. Tente novamente.");
  });

  it("traduz erro de domínio não autorizado", () => {
    expect(mapAuthError({ code: "auth/unauthorized-domain" })).toContain(
      "domínio não está autorizado",
    );
  });

  it("retorna mensagem padrão para erro desconhecido", () => {
    expect(mapAuthError(new Error("falha"))).toBe(
      "Não foi possível entrar. Tente de novo em instantes.",
    );
  });
});
