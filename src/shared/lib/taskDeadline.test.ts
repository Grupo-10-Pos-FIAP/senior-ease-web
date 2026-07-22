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

    expect(getTaskDeadlineBadgeLabel("2026-07-21")).toBe("Prazo termina hoje");
    expect(getTaskDeadlineBadgeLabel("2026-07-22")).toBe("Prazo termina daqui 1 dia");
    expect(getTaskDeadlineBadgeLabel("2026-07-23")).toBe("Prazo termina daqui 2 dias");
    expect(getTaskDeadlineBadgeLabel("2026-07-28")).toBe("Prazo termina daqui 7 dias");
    expect(getTaskDeadlineBadgeLabel("2026-09-30")).toBeNull();
    expect(getTaskDeadlineBadgeLabel("2026-07-20")).toBeNull();
  });

  it("retorna tom vermelho para hoje e verde para 7 dias", () => {
    const referenceDate = new Date(`${TASK_MOCK_REFERENCE_DATE}T12:00:00`);

    expect(getTaskDeadlineBadgeTone("2026-07-21", referenceDate)).toBe("today");
    expect(getTaskDeadlineBadgeTone("2026-07-28", referenceDate)).toBe("week");
    expect(getTaskDeadlineBadgeTone("2026-07-22", referenceDate)).toBe("upcoming");
    expect(getTaskDeadlineBadgeTone("2026-09-30", referenceDate)).toBeNull();
  });

  it("ordena atividades ativas pela data final mais próxima", () => {
    const tasks = [
      createTask({
        id: "task-13",
        title: 'Oficina "Planejando o Orçamento Mensal"',
        startDate: "2026-07-15",
        endDate: "2026-09-30",
        status: "active",
      }),
      createTask({
        id: "task-15",
        title: 'Oficina "Criando sua Conta de E-mail"',
        startDate: "2026-07-15",
        endDate: "2026-08-31",
        status: "active",
      }),
      createTask({
        id: "task-14",
        title: 'Atividade "Conferindo Avisos no Celular"',
        startDate: "2026-07-15",
        endDate: "2026-08-30",
        status: "active",
      }),
      createTask({
        id: "task-1",
        title: 'Oficina "Primeiros Passos no Digital"',
        startDate: "2026-07-15",
        endDate: "2026-08-05",
        status: "active",
      }),
    ];

    const sorted = sortActiveTasksByDeadline(tasks);

    expect(sorted.map((task) => task.id)).toEqual(["task-1", "task-14", "task-15", "task-13"]);
  });
});
