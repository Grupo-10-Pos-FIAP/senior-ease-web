import { http, HttpResponse } from "msw";
import { createAccessibilityPreferences } from "@domain/entities/AccessibilityPreferences";
import { getPreferencesFromDb, updatePreferencesInDb } from "@infrastructure/msw/db/preferences.db";
import { toPreferencesDto } from "@infrastructure/mappers/preferences.mapper";

export const preferencesHandlers = [
  http.get("/api/users/:id/preferences", ({ params }) => {
    const userId = params.id as string;
    const dto = getPreferencesFromDb(userId);

    if (!dto) {
      return HttpResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
    }

    return HttpResponse.json(dto);
  }),

  http.put("/api/users/:id/preferences", async ({ params, request }) => {
    const userId = params.id as string;
    const body = await request.json();
    const preferences = createAccessibilityPreferences(body as Record<string, unknown>);
    const dto = toPreferencesDto(preferences);
    updatePreferencesInDb(userId, dto);

    return HttpResponse.json(dto);
  }),
];
