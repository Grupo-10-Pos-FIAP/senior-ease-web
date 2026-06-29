import { describe, expect, it } from "vitest";
import {
  calculateAgeFromBirthDate,
  createUser,
  formatUserAge,
  formatUserDisability,
} from "@domain/entities/User";

const validInput = {
  id: "demo-user",
  fullName: "Antônio José Maria da Silva",
  birthDate: "1959-01-15",
  registrationId: "2026067",
  disability: "Baixa visão",
  email: "antoniojose@seniorease.com.br",
  phone: "(85) 96767-6767",
};

describe("createUser", () => {
  it("cria usuário válido", () => {
    const user = createUser(validInput);

    expect(user).toEqual({
      id: "demo-user",
      fullName: "Antônio José Maria da Silva",
      birthDate: "1959-01-15",
      registrationId: "2026067",
      disability: "Baixa visão",
      email: "antoniojose@seniorease.com.br",
      phone: "(85) 96767-6767",
    });
  });

  it("normaliza espaços e disability vazia", () => {
    const user = createUser({
      ...validInput,
      fullName: "  Maria  ",
      disability: "   ",
    });

    expect(user.fullName).toBe("Maria");
    expect(user.disability).toBeNull();
  });

  it("rejeita nome vazio", () => {
    expect(() => createUser({ ...validInput, fullName: "   " })).toThrow(/nome completo/i);
  });

  it("rejeita data de nascimento inválida", () => {
    expect(() => createUser({ ...validInput, birthDate: "" })).toThrow(/data de nascimento/i);
    expect(() => createUser({ ...validInput, birthDate: "31/01/1959" })).toThrow(
      /data de nascimento/i,
    );
    expect(() => createUser({ ...validInput, birthDate: "1959-02-30" })).toThrow(
      /data de nascimento/i,
    );
  });

  it("rejeita data de nascimento no futuro", () => {
    expect(() => createUser({ ...validInput, birthDate: "2099-01-01" })).toThrow(/futuro/i);
  });

  it("rejeita idade fora do intervalo permitido", () => {
    expect(() => createUser({ ...validInput, birthDate: "2025-12-01" })).toThrow(/idade/i);
    expect(() => createUser({ ...validInput, birthDate: "1800-01-01" })).toThrow(/idade/i);
  });

  it("rejeita matrícula vazia", () => {
    expect(() => createUser({ ...validInput, registrationId: "" })).toThrow(/matrícula/i);
  });

  it("rejeita e-mail inválido", () => {
    expect(() => createUser({ ...validInput, email: "invalido" })).toThrow(/e-mail/i);
  });

  it("rejeita telefone vazio", () => {
    expect(() => createUser({ ...validInput, phone: "  " })).toThrow(/telefone/i);
  });

  it("rejeita telefone com poucos dígitos", () => {
    expect(() => createUser({ ...validInput, phone: "(85) 9676" })).toThrow(/telefone/i);
  });
});

describe("calculateAgeFromBirthDate", () => {
  it("calcula idade considerando mês e dia", () => {
    const reference = new Date(2026, 5, 28);
    expect(calculateAgeFromBirthDate("1959-01-15", reference)).toBe(67);
    expect(calculateAgeFromBirthDate("1959-07-01", reference)).toBe(66);
  });
});

describe("formatUserAge", () => {
  it("formata idade no singular e plural", () => {
    expect(formatUserAge("2025-06-28")).toBe("1 ano");
    expect(formatUserAge("1959-01-15")).toBe("67 anos");
  });

  it("exibe Não informada quando vazia", () => {
    expect(formatUserAge("")).toBe("Não informada");
  });
});

describe("formatUserDisability", () => {
  it("exibe Nenhuma quando vazio", () => {
    expect(formatUserDisability(null)).toBe("Nenhuma");
    expect(formatUserDisability("Baixa visão")).toBe("Baixa visão");
  });
});
