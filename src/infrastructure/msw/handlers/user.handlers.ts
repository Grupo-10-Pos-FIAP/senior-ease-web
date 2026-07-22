import { http, HttpResponse } from "msw";
import {
  deactivateUserInDb,
  deleteUserFromDb,
  getUserFromDb,
  reactivateUserInDb,
  updateUserInDb,
} from "@infrastructure/msw/db/user.db";
import { toUserDto, toValidatedUser } from "@infrastructure/mappers/user.mapper";
import { fromAccountLifecycleDto } from "@infrastructure/mappers/user.mapper";

export const userHandlers = [
  http.get("/api/users/:id", ({ params }) => {
    const userId = params.id as string;
    const dto = getUserFromDb(userId);

    if (!dto) {
      return HttpResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    return HttpResponse.json({
      ...dto,
      ...fromAccountLifecycleDto(dto),
    });
  }),

  http.patch("/api/users/:id", async ({ params, request }) => {
    const userId = params.id as string;
    const current = getUserFromDb(userId);

    if (!current) {
      return HttpResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    try {
      const body = (await request.json()) as Record<string, unknown>;
      const user = toValidatedUser({
        ...current,
        fullName: (body.fullName as string | undefined) ?? current.fullName,
        birthDate: (body.birthDate as string | undefined) ?? current.birthDate,
        registrationId: (body.registrationId as string | undefined) ?? current.registrationId,
        disability:
          body.disability !== undefined ? (body.disability as string | null) : current.disability,
        email: (body.email as string | undefined) ?? current.email,
        phone: (body.phone as string | undefined) ?? current.phone,
      });
      const lifecycle = fromAccountLifecycleDto(current);
      const dto = toUserDto(user, lifecycle);
      updateUserInDb(userId, dto);
      return HttpResponse.json(dto);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dados inválidos";
      return HttpResponse.json({ message }, { status: 400 });
    }
  }),

  http.post("/api/users/:id/deactivate", ({ params }) => {
    const userId = params.id as string;
    const dto = deactivateUserInDb(userId);

    if (!dto) {
      return HttpResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    return HttpResponse.json(dto);
  }),

  http.post("/api/users/:id/reactivate", ({ params }) => {
    const userId = params.id as string;
    const dto = reactivateUserInDb(userId);

    if (!dto) {
      return HttpResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    return HttpResponse.json(dto);
  }),

  http.delete("/api/users/:id", ({ params }) => {
    const userId = params.id as string;
    const deleted = deleteUserFromDb(userId);

    if (!deleted) {
      return HttpResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
