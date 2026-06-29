import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import { TaskListPanel } from "@presentation/features/tasks/TaskListPanel";
import { resetTasksDb, TASK_MOCK_REFERENCE_DATE } from "@infrastructure/msw/db/tasks.db";
import { applyAccessibilityTokens } from "@shared/lib/accessibilityTokens";
import { renderWithProviders } from "@shared/test/renderWithProviders";

async function waitForTasksLoaded() {
  await waitFor(() => {
    expect(screen.queryByText(/carregando atividades/i)).not.toBeInTheDocument();
  });
}

function useMockReferenceDate() {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(`${TASK_MOCK_REFERENCE_DATE}T12:00:00`));
}

describe("TaskListPanel", () => {
  beforeEach(() => {
    resetTasksDb();
    applyAccessibilityTokens(createDefaultPreferences());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exibe abas de filtro por status", async () => {
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    expect(screen.getByRole("tab", { name: /minhas atividades/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /atividades concluídas/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /atividades expiradas/i })).toBeInTheDocument();
  });

  it("lista atividades ativas do mockup", async () => {
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    expect(
      screen.getByRole("heading", { name: /primeiros passos no digital/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /como usar e-mail/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /videochamadas sem medo/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /segurança digital/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /planejando o orçamento mensal/i }),
    ).toBeInTheDocument();
  });

  it("ordena atividades ativas pela data final mais próxima", async () => {
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);

    expect(titles).toEqual([
      'Oficina "Primeiros Passos no Digital"',
      'Curso "Como usar E-mail"',
      'Atividade "Videochamadas sem Medo"',
      "Oficina de Segurança Digital",
      'Atividade "Organizando Arquivos no Computador"',
      'Curso "Pesquisando na Internet com Segurança"',
      'Oficina "Usando o Teclado com Confiança"',
      'Atividade "Introdução ao WhatsApp"',
      'Oficina "Planejando o Orçamento Mensal"',
    ]);
  });

  it("exibe badges de prazo para todos os cenários de até 7 dias", async () => {
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    expect(screen.getByText("Prazo termina hoje")).toBeInTheDocument();
    expect(screen.getByText("Prazo termina daqui 1 dia")).toBeInTheDocument();
    expect(screen.getByText("Prazo termina daqui 2 dias")).toBeInTheDocument();
    expect(screen.getByText("Prazo termina daqui 3 dias")).toBeInTheDocument();
    expect(screen.getByText("Prazo termina daqui 4 dias")).toBeInTheDocument();
    expect(screen.getByText("Prazo termina daqui 5 dias")).toBeInTheDocument();
    expect(screen.getByText("Prazo termina daqui 6 dias")).toBeInTheDocument();
    expect(screen.getByText("Prazo termina daqui 7 dias")).toBeInTheDocument();
  });

  it("não exibe badge de prazo para atividades com mais de 7 dias para vencer", async () => {
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    const budgetCard = screen
      .getByRole("heading", { name: /planejando o orçamento mensal/i })
      .closest("article");

    expect(budgetCard).toBeInTheDocument();
    expect(budgetCard).not.toHaveTextContent(/prazo termina/i);
    expect(screen.getAllByText(/prazo termina/i)).toHaveLength(8);
  });

  it("filtra atividades concluídas na aba correspondente", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    await user.click(screen.getByRole("tab", { name: /atividades concluídas/i }));

    expect(await screen.findByRole("heading", { name: /currículo digital/i })).toBeInTheDocument();
    expect(screen.getAllByText("Atividade concluída").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.queryByRole("link", { name: /como fazer essa atividade/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /primeiros passos no digital/i }),
    ).not.toBeInTheDocument();
  });

  it("exibe link como fazer essa atividade para cada atividade ativa", async () => {
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    const links = screen.getAllByRole("link", { name: /como fazer essa atividade/i });
    expect(links).toHaveLength(9);
    expect(links[0]).toHaveAttribute("href", "/tarefas/task-1/guia");
  });

  it("exibe iniciar a atividade quando nenhuma tarefa foi concluída", async () => {
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    expect(
      screen.getByRole("button", {
        name: /iniciar a atividade: oficina "primeiros passos no digital"/i,
      }),
    ).toBeInTheDocument();
  });

  it("pede confirmação antes de iniciar a atividade", async () => {
    const user = userEvent.setup();
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    await user.click(
      screen.getByRole("button", {
        name: /iniciar a atividade: oficina "primeiros passos no digital"/i,
      }),
    );

    expect(
      await screen.findByRole("alertdialog", { name: /iniciar esta atividade/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /você está prestes a começar a atividade "oficina "primeiros passos no digital""/i,
      ),
    ).toBeInTheDocument();
  });

  it("exibe continuar a atividade quando há progresso parcial", async () => {
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    expect(
      screen.getByRole("link", { name: /continuar a atividade: curso "como usar e-mail"/i }),
    ).toHaveAttribute("href", "/tarefas/task-2");
  });

  it("não exibe botão de concluir atividade na lista", async () => {
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    expect(screen.queryByRole("button", { name: /concluir atividade/i })).not.toBeInTheDocument();
  });

  it("exibe layout de atividades expiradas com badge e mensagem de prazo", async () => {
    const user = userEvent.setup();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    await user.click(screen.getByRole("tab", { name: /atividades expiradas/i }));

    expect(
      await screen.findByRole("heading", { name: /simulação de situações reais/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Atividade expirada!").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("O prazo para essa atividade já se expirou.").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.queryByRole("button", { name: /refazer atividade/i })).not.toBeInTheDocument();
  });
});
