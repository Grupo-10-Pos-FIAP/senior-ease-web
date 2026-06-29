import { describe, expect, it, beforeEach } from "vitest";
import { resetUserDb } from "@infrastructure/msw/db/user.db";
import type { UserDto } from "@infrastructure/mappers/user.mapper";

describe("user.handlers", () => {
  beforeEach(() => {
    resetUserDb();
  });

  it("GET /api/users/:id retorna usuário demo", async () => {
    const response = await fetch("/api/users/demo-user");
    expect(response.status).toBe(200);

    const body = (await response.json()) as UserDto;
    expect(body.fullName).toBe("Antônio José Maria da Silva");
    expect(body.birthDate).toBe("1959-01-15");
  });

  it("PATCH /api/users/:id atualiza dados parcialmente", async () => {
    const response = await fetch("/api/users/demo-user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: "Maria Souza" }),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as UserDto;
    expect(body.fullName).toBe("Maria Souza");
    expect(body.birthDate).toBe("1959-01-15");
  });

  it("PATCH rejeita e-mail inválido", async () => {
    const response = await fetch("/api/users/demo-user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalido" }),
    });

    expect(response.status).toBe(400);
  });

  it("DELETE /api/users/:id remove usuário", async () => {
    const deleteResponse = await fetch("/api/users/demo-user", { method: "DELETE" });
    expect(deleteResponse.status).toBe(204);

    const getResponse = await fetch("/api/users/demo-user");
    expect(getResponse.status).toBe(404);
  });

  it("GET retorna 404 para usuário inexistente", async () => {
    const response = await fetch("/api/users/inexistente");
    expect(response.status).toBe(404);
  });
});
