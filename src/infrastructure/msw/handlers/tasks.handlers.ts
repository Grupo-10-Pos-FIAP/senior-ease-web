import { http, HttpResponse } from "msw";
import {
  completeGuideStepInDb,
  completeStepInDb,
  completeTaskInDb,
  getTaskFromDb,
  getTasksFromDb,
  resetActivityInDb,
  startActivityInDb,
  updateCurrentStepInDb,
} from "@infrastructure/msw/db/tasks.db";
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

  http.patch("/api/tasks/:id/start", async ({ params, request }) => {
    const id = params.id as string;
    const userId = resolveUserId(request);
    const body = (await request.json()) as { stepId?: string };
    const stepId = body.stepId;

    if (!stepId) {
      return HttpResponse.json({ message: "stepId é obrigatório" }, { status: 400 });
    }

    const dto = getTaskFromDb(id, userId);
    if (!dto) {
      return HttpResponse.json({ message: "Atividade não encontrada" }, { status: 404 });
    }

    if (dto.status !== "active") {
      return HttpResponse.json(
        { message: "A atividade não pode ser iniciada no estado atual" },
        { status: 409 },
      );
    }

    const started = startActivityInDb(id, stepId, userId);
    return HttpResponse.json(started);
  }),

  http.patch("/api/tasks/:id/guide/:stepId", ({ params, request }) => {
    const id = params.id as string;
    const stepId = params.stepId as string;
    const userId = resolveUserId(request);

    const dto = getTaskFromDb(id, userId);
    if (!dto) {
      return HttpResponse.json({ message: "Atividade não encontrada" }, { status: 404 });
    }

    if (dto.status === "expired") {
      return HttpResponse.json(
        { message: "O tutorial não pode ser concluído no estado atual" },
        { status: 409 },
      );
    }

    const updated = completeGuideStepInDb(id, stepId, userId);
    if (!updated) {
      return HttpResponse.json({ message: "Atividade não encontrada" }, { status: 404 });
    }
    return HttpResponse.json(updated);
  }),

  http.patch("/api/tasks/:id/steps/:stepId", async ({ params, request }) => {
    const id = params.id as string;
    const stepId = params.stepId as string;
    const userId = resolveUserId(request);
    const body = (await request.json().catch(() => ({}))) as { answer?: string };

    const dto = getTaskFromDb(id, userId);
    if (!dto) {
      return HttpResponse.json({ message: "Atividade não encontrada" }, { status: 404 });
    }

    if (dto.status !== "active") {
      return HttpResponse.json(
        { message: "A tarefa não pode ser concluída no estado atual" },
        { status: 409 },
      );
    }

    const updated = completeStepInDb(id, stepId, userId, body.answer);
    return HttpResponse.json(updated);
  }),

  http.patch("/api/tasks/:id/current-step", async ({ params, request }) => {
    const id = params.id as string;
    const userId = resolveUserId(request);
    const body = (await request.json()) as { stepId?: string };
    const stepId = body.stepId;

    if (!stepId) {
      return HttpResponse.json({ message: "stepId é obrigatório" }, { status: 400 });
    }

    const dto = getTaskFromDb(id, userId);
    if (!dto) {
      return HttpResponse.json({ message: "Atividade não encontrada" }, { status: 404 });
    }

    const updated = updateCurrentStepInDb(id, stepId, userId);
    return HttpResponse.json(updated);
  }),

  http.patch("/api/tasks/:id/reset", ({ params, request }) => {
    const id = params.id as string;
    const userId = resolveUserId(request);

    const dto = getTaskFromDb(id, userId);
    if (!dto) {
      return HttpResponse.json({ message: "Atividade não encontrada" }, { status: 404 });
    }

    const reset = resetActivityInDb(id, userId);
    return HttpResponse.json(reset);
  }),
];
