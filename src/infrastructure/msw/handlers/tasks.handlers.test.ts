import { describe, expect, it, beforeEach } from "vitest";
import { HttpClient } from "@infrastructure/api/HttpClient";
import { HttpTaskRepository } from "@infrastructure/repositories/HttpTaskRepository";
import { resetTasksDb } from "@infrastructure/msw/db/tasks.db";

describe("tasks MSW handlers", () => {
  beforeEach(() => {
    resetTasksDb();
  });

  it("GET /api/tasks retorna lista seed", async () => {
    const repo = new HttpTaskRepository(new HttpClient());
    const tasks = await repo.list("demo-user");

    expect(tasks.length).toBeGreaterThanOrEqual(4);
    expect(tasks.filter((task) => task.status === "active").length).toBe(4);
  });

  it("GET /api/tasks/:id retorna detalhe", async () => {
    const repo = new HttpTaskRepository(new HttpClient());
    const task = await repo.getById("task-1");

    expect(task.title).toContain("Primeiros Passos no Digital");
  });

  it("PATCH /api/tasks/:id/complete conclui atividade ativa", async () => {
    const repo = new HttpTaskRepository(new HttpClient());
    const completed = await repo.complete("task-1");

    expect(completed.status).toBe("completed");

    const tasks = await repo.list("demo-user");
    expect(tasks.find((task) => task.id === "task-1")?.status).toBe("completed");
  });
});
