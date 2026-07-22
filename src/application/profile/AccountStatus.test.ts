import { describe, expect, it } from "vitest";
import { DeactivateUser, ReactivateUser } from "@application/profile/AccountStatus";
import { createUser } from "@domain/entities/User";
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

describe("AccountStatus use cases", () => {
  it("desativa e reativa preservando o usuário", async () => {
    const repository = new FakeUserRepository(demoUser);
    const deactivateUser = new DeactivateUser(repository);
    const reactivateUser = new ReactivateUser(repository);

    const deactivated = await deactivateUser.execute("demo-user");
    expect(deactivated.accountStatus).toBe("deactivated");
    expect(deactivated.deactivatedAt).toBeTruthy();
    expect(deactivated.purgeAt).toBeTruthy();
    expect(await repository.get("demo-user")).toMatchObject({ id: "demo-user" });

    const reactivated = await reactivateUser.execute("demo-user");
    expect(reactivated.accountStatus).toBe("active");
    expect(reactivated.deactivatedAt).toBeNull();
  });
});
