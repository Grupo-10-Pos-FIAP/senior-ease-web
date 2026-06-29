import { describe, expect, it } from "vitest";
import { createUser } from "@domain/entities/User";
import { ageToBirthDate, fromUserDto, toUserDto } from "@infrastructure/mappers/user.mapper";

describe("user.mapper", () => {
  it("converte User para DTO e de volta", () => {
    const user = createUser({
      id: "demo-user",
      fullName: "Antônio José Maria da Silva",
      birthDate: "1959-01-15",
      registrationId: "2026067",
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
      fullName: "Complete seu perfil",
      birthDate: "",
      registrationId: "-",
      disability: null,
      email: "test@gmail.com",
      phone: "-",
    });

    expect(user.phone).toBe("");
    expect(user.birthDate).toBe("");
  });
});
