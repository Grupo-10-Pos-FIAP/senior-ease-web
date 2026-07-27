import { describe, expect, it } from "vitest";
import { createUser, INCOMPLETE_PROFILE_NAME } from "@domain/entities/User";
import { ageToBirthDate, fromUserDto, toUserDto } from "@infrastructure/mappers/user.mapper";

describe("user.mapper", () => {
  it("converte User para DTO e de volta", () => {
    const user = createUser({
      id: "demo-user",
      fullName: "Antônio José Maria da Silva",
      birthDate: "1959-01-15",
      registrationId: "SE01001",
      disability: "Baixa visão",
      email: "antoniojose@seniorease.com.br",
      phone: "(85) 96767-6767",
    });

    const dto = toUserDto(user);
    expect(fromUserDto(dto)).toEqual(user);
  });

  it("converte documento legado com age para birthDate", () => {
    const user = fromUserDto({
      id: "user-1",
      fullName: "Maria Souza",
      age: 67,
      registrationId: "123",
      disability: null,
      email: "maria@example.com",
      phone: "(11) 99999-9999",
    });

    expect(user.birthDate).toBe(ageToBirthDate(67));
    expect(user.fullName).toBe("Maria Souza");
  });

  it("normaliza telefone placeholder de perfil incompleto", () => {
    const user = fromUserDto({
      id: "user-1",
      fullName: INCOMPLETE_PROFILE_NAME,
      birthDate: "",
      registrationId: "",
      disability: null,
      email: "test@gmail.com",
      phone: "-",
    });

    expect(user.phone).toBe("");
    expect(user.birthDate).toBe("");
    expect(user.registrationId).toBe("");
  });

  it("descarta matrícula inválida na leitura (alocação sequencial é na infraestrutura)", () => {
    const uid = "q8uxtuQAjNUOzXGYM2uJ9iXYW6P2";
    const user = fromUserDto({
      id: uid,
      fullName: INCOMPLETE_PROFILE_NAME,
      birthDate: "",
      registrationId: uid,
      disability: null,
      email: "admin@bloomia.com",
      phone: "",
    });

    expect(user.registrationId).toBe("");
  });
});
