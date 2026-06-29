import { describe, expect, it } from "vitest";
import { createTask, getActivityProgress, isTaskActive } from "@domain/entities/Task";

describe("Task", () => {
  const baseInput = {
    id: "task-1",
    title: 'Oficina "Primeiros Passos no Digital"',
    startDate: "2026-06-05",
    endDate: "2026-06-14",
    status: "active" as const,
    steps: [
      {
        id: "step-1",
        label: "Abrir o navegador",
        type: "content_reading" as const,
        completed: false,
        order: 1,
      },
    ],
  };

  it("cria atividade válida", () => {
    const task = createTask(baseInput);

    expect(task.title).toBe('Oficina "Primeiros Passos no Digital"');
    expect(task.status).toBe("active");
    expect(task.steps).toHaveLength(1);
  });

  it("rejeita título vazio", () => {
    expect(() => createTask({ ...baseInput, title: "   " })).toThrow(/título/i);
  });

  it("rejeita data inválida", () => {
    expect(() => createTask({ ...baseInput, startDate: "05/06/2026" })).toThrow(/datas/i);
  });

  it("rejeita intervalo invertido", () => {
    expect(() =>
      createTask({ ...baseInput, startDate: "2026-06-20", endDate: "2026-06-01" }),
    ).toThrow(/data inicial/i);
  });

  it("identifica atividade ativa", () => {
    expect(isTaskActive(createTask(baseInput))).toBe(true);
    expect(isTaskActive(createTask({ ...baseInput, status: "completed" }))).toBe(false);
  });

  it("identifica atividade não iniciada", () => {
    expect(getActivityProgress(createTask(baseInput))).toBe("not_started");
  });

  it("identifica atividade em andamento", () => {
    const task = createTask({
      ...baseInput,
      steps: [
        {
          id: "step-1",
          label: "Abrir o navegador",
          type: "content_reading" as const,
          completed: true,
          order: 1,
        },
        {
          id: "step-2",
          label: "Fechar o navegador",
          type: "multiple_choice" as const,
          completed: false,
          order: 2,
        },
      ],
    });

    expect(getActivityProgress(task)).toBe("in_progress");
  });

  it("rejeita tipo de tarefa inválido", () => {
    expect(() =>
      createTask({
        ...baseInput,
        steps: [
          {
            id: "step-1",
            label: "Passo inválido",
            type: "quiz" as "content_reading",
            completed: false,
            order: 1,
          },
        ],
      }),
    ).toThrow(/tipo de tarefa inválido/i);
  });

  it("retorna null para atividade concluída ou expirada", () => {
    expect(getActivityProgress(createTask({ ...baseInput, status: "completed" }))).toBeNull();
    expect(getActivityProgress(createTask({ ...baseInput, status: "expired" }))).toBeNull();
  });

  it("considera in_progress quando currentStepId existe", () => {
    const withCurrentStep = createTask({
      ...baseInput,
      currentStepId: "step-1",
    });

    expect(getActivityProgress(withCurrentStep)).toBe("in_progress");
  });
});
