import { http, HttpResponse } from "msw";
import { completeTaskInDb, getTaskFromDb, getTasksFromDb } from "@infrastructure/msw/db/tasks.db";
import { fromTaskDto, toTaskDto } from "@infrastructure/mappers/task.mapper";

function resolveUserId(request: Request): string {
  const url = new URL(request.url);
  return url.searchParams.get("userId") ?? "demo-user";
}

export const tasksHandlers = [
  http.get("/api/tasks", ({ request }) => {
    const userId = resolveUserId(request);
    const tasks = getTasksFromDb(userId).map((dto) => fromTaskDto(dto));
    return HttpResponse.json(tasks.map((task) => toTaskDto(task)));
  }),

  http.get("/api/tasks/:id", ({ params, request }) => {
    const id = params.id as string;
    const userId = resolveUserId(request);
    const dto = getTaskFromDb(id, userId);

    if (!dto) {
      return HttpResponse.json({ message: "Atividade não encontrada" }, { status: 404 });
    }

    return HttpResponse.json(dto);
  }),

  http.patch("/api/tasks/:id/complete", ({ params, request }) => {
    const id = params.id as string;
    const userId = resolveUserId(request);
    const dto = getTaskFromDb(id, userId);

    if (!dto) {
      return HttpResponse.json({ message: "Atividade não encontrada" }, { status: 404 });
    }

    if (dto.status !== "active") {
      return HttpResponse.json(
        { message: "A atividade não pode ser concluída no estado atual" },
        { status: 409 },
      );
    }

    const completed = completeTaskInDb(id, userId);
    return HttpResponse.json(completed);
  }),
];
