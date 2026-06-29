import { afterEach, describe, expect, it, vi } from "vitest";
import { createTask } from "@domain/entities/Task";
import { TASK_MOCK_REFERENCE_DATE } from "@infrastructure/seed/activityCatalog.seed";
import {
  getCalendarDaysUntil,
  getTaskDeadlineBadgeLabel,
  getTaskDeadlineBadgeTone,
  sortActiveTasksByDeadline,
} from "./taskDeadline";

describe("taskDeadline", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("calcula dias restantes em relação à data de referência", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-20T12:00:00"));

    expect(getCalendarDaysUntil("2026-06-20")).toBe(0);
    expect(getCalendarDaysUntil("2026-06-21")).toBe(1);
    expect(getCalendarDaysUntil("2026-06-27")).toBe(7);
    expect(getCalendarDaysUntil("2026-06-28")).toBe(8);
    expect(getCalendarDaysUntil("2026-06-14")).toBe(-6);
  });

  it("retorna badge apenas para prazos entre hoje e 7 dias", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${TASK_MOCK_REFERENCE_DATE}T12:00:00`));

    expect(getTaskDeadlineBadgeLabel("2026-06-29")).toBe("Prazo termina hoje");
    expect(getTaskDeadlineBadgeLabel("2026-06-30")).toBe("Prazo termina daqui 1 dia");
    expect(getTaskDeadlineBadgeLabel("2026-07-01")).toBe("Prazo termina daqui 2 dias");
    expect(getTaskDeadlineBadgeLabel("2026-07-06")).toBe("Prazo termina daqui 7 dias");
    expect(getTaskDeadlineBadgeLabel("2026-07-15")).toBeNull();
    expect(getTaskDeadlineBadgeLabel("2026-06-28")).toBeNull();
  });

  it("retorna tom vermelho para hoje e verde para 7 dias", () => {
    const referenceDate = new Date("2026-06-29T12:00:00");

    expect(getTaskDeadlineBadgeTone("2026-06-29", referenceDate)).toBe("today");
    expect(getTaskDeadlineBadgeTone("2026-07-06", referenceDate)).toBe("week");
    expect(getTaskDeadlineBadgeTone("2026-06-30", referenceDate)).toBe("upcoming");
    expect(getTaskDeadlineBadgeTone("2026-07-15", referenceDate)).toBeNull();
  });

  it("ordena atividades ativas pela data final mais próxima", () => {
    const tasks = [
      createTask({
        id: "task-13",
        title: 'Oficina "Planejando o Orçamento Mensal"',
        startDate: "2026-06-15",
        endDate: "2026-07-15",
        status: "active",
      }),
      createTask({
        id: "task-2",
        title: 'Curso "Como usar E-mail"',
        startDate: "2026-06-10",
        endDate: "2026-06-30",
        status: "active",
      }),
      createTask({
        id: "task-1",
        title: 'Oficina "Primeiros Passos no Digital"',
        startDate: "2026-06-10",
        endDate: "2026-06-29",
        status: "active",
      }),
      createTask({
        id: "task-4",
        title: "Oficina de Segurança Digital",
        startDate: "2026-06-15",
        endDate: "2026-07-02",
        status: "active",
      }),
    ];

    const sorted = sortActiveTasksByDeadline(tasks);

    expect(sorted.map((task) => task.id)).toEqual(["task-1", "task-2", "task-4", "task-13"]);
  });
});
