import { describe, expect, it } from "vitest";
import { createUser } from "@domain/entities/User";
import { UpdateUser } from "@application/profile/UpdateUser";
import { FakeUserRepository } from "@shared/test/fakes/FakeUserRepository";

const demoUser = createUser({
  id: "demo-user",
  fullName: "Antônio José Maria da Silva",
  birthDate: "1959-01-15",
  registrationId: "2026067",
  disability: "Baixa visão",
  email: "antoniojose@seniorease.com.br",
  phone: "(85) 96767-6767",
});

describe("UpdateUser", () => {
  it("mescla dados atuais com input parcial", async () => {
    const repository = new FakeUserRepository(demoUser);
    const updateUser = new UpdateUser(repository);

    const updated = await updateUser.execute("demo-user", {
      fullName: "Maria Souza",
    });

    expect(updated.fullName).toBe("Maria Souza");
    expect(updated.birthDate).toBe("1959-01-15");
    expect(updated.email).toBe("antoniojose@seniorease.com.br");
  });

  it("rejeita input inválido", async () => {
    const repository = new FakeUserRepository(demoUser);
    const updateUser = new UpdateUser(repository);

    await expect(updateUser.execute("demo-user", { email: "email-invalido" })).rejects.toThrow(
      /e-mail/i,
    );
  });
});
