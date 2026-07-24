import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createAccessibilityPreferences,
  createDefaultPreferences,
} from "@domain/entities/AccessibilityPreferences";
import { TaskListPanel } from "@presentation/features/tasks/TaskListPanel";
import { toPreferencesDto } from "@infrastructure/mappers/preferences.mapper";
import {
  completeGuideStepInDb,
  resetTasksDb,
  TASK_MOCK_REFERENCE_DATE,
} from "@infrastructure/msw/db/tasks.db";
import { resetPreferencesDb, updatePreferencesInDb } from "@infrastructure/msw/db/preferences.db";
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

function setInterfaceMode(mode: "standard" | "simplified") {
  updatePreferencesInDb(
    "demo-user",
    toPreferencesDto(createAccessibilityPreferences({ interfaceMode: mode })),
  );
}

describe("TaskListPanel", () => {
  beforeEach(() => {
    resetTasksDb();
    resetPreferencesDb();
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
    expect(screen.getByRole("heading", { name: /como usar o e-mail/i })).toBeInTheDocument();
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
      "Primeiros passos no digital",
      "Como usar o e-mail",
      "Videochamadas sem medo",
      "Segurança digital",
      "Organizando arquivos no computador",
      "Pesquisando na internet com segurança",
      "Usando o teclado com confiança",
      "Introdução ao WhatsApp",
      "Salvando contatos de emergência",
      "Reconhecendo links confiáveis",
      "Reconhecendo links seguros",
      "Usando o calendário digital",
      "Conferindo avisos no celular",
      "WhatsApp no celular e no computador",
      "Criando sua conta de e-mail",
      "Pedindo ajuda por mensagem",
      "Simulação de situações reais",
      "Compras online com segurança",
      "Planejando o orçamento mensal",
    ]);
  });

  it("não exibe badge de prazo quando o vencimento está além de 7 dias", async () => {
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    const budgetCard = screen
      .getByRole("heading", { name: /planejando o orçamento mensal/i })
      .closest("article");

    expect(budgetCard).toBeInTheDocument();
    expect(budgetCard).not.toHaveTextContent(/prazo termina/i);
    expect(screen.queryByText(/prazo termina/i)).not.toBeInTheDocument();
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

  it("no modo avançado exibe ajuda como ícone ao lado do título", async () => {
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    const links = await screen.findAllByRole("link", { name: /como fazer essa atividade/i });
    expect(links).toHaveLength(19);
    expect(links[0]).toHaveAttribute("href", "/tarefas/task-1/guia");
    expect(links[0]).toHaveClass("activity-card__howto-icon");
    expect(screen.queryByText("Como fazer essa atividade?")).not.toBeInTheDocument();
  });

  it("no modo básico exibe botão como fazer essa atividade", async () => {
    useMockReferenceDate();
    setInterfaceMode("simplified");
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    await waitFor(() => {
      expect(screen.getAllByText("Como fazer essa atividade?").length).toBeGreaterThan(0);
    });

    const links = screen.getAllByRole("link", { name: /como fazer essa atividade/i });
    expect(links).toHaveLength(19);
    expect(links[0]).toHaveAttribute("href", "/tarefas/task-1/guia");
    expect(links[0]).toHaveClass("activity-card__link");
  });

  it("exibe rever como fazer essa atividade após concluir o tutorial", async () => {
    useMockReferenceDate();
    completeGuideStepInDb("task-1", "step-1-1");
    completeGuideStepInDb("task-1", "step-1-2");
    completeGuideStepInDb("task-1", "step-1-3");
    completeGuideStepInDb("task-1", "step-1-4");

    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    expect(
      await screen.findByRole("link", {
        name: /rever como fazer essa atividade: primeiros passos no digital/i,
      }),
    ).toHaveAttribute("href", "/tarefas/task-1/guia");
    expect(
      screen.queryByRole("link", {
        name: /^como fazer essa atividade: primeiros passos no digital$/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("no modo avançado inicia a atividade sem modal de confirmação", async () => {
    const user = userEvent.setup();
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    expect(
      screen.getByRole("button", {
        name: /^iniciar: primeiros passos no digital$/i,
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /^iniciar: primeiros passos no digital$/i,
      }),
    );

    expect(
      screen.queryByRole("alertdialog", { name: /iniciar esta atividade/i }),
    ).not.toBeInTheDocument();
  });

  it("no modo básico mantém textos completos de iniciar atividade", async () => {
    const user = userEvent.setup();
    useMockReferenceDate();
    setInterfaceMode("simplified");
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    const startButton = await screen.findByRole("button", {
      name: /iniciar a atividade: primeiros passos no digital/i,
    });
    await user.click(startButton);

    expect(
      await screen.findByRole("alertdialog", { name: /iniciar esta atividade/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/você está prestes a começar "primeiros passos no digital"/i),
    ).toBeInTheDocument();
  });

  it("exibe continuar quando há progresso parcial no modo avançado", async () => {
    useMockReferenceDate();
    renderWithProviders(<TaskListPanel />);
    await waitForTasksLoaded();

    expect(screen.getByRole("link", { name: /^continuar: como usar o e-mail$/i })).toHaveAttribute(
      "href",
      "/tarefas/task-2",
    );
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
      await screen.findByRole("heading", { name: /criando conta de e-mail/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Atividade expirada!").length).toBeGreaterThanOrEqual(5);
    expect(
      screen.getAllByText("O prazo para essa atividade já se expirou.").length,
    ).toBeGreaterThanOrEqual(5);
    expect(screen.queryByRole("button", { name: /refazer atividade/i })).not.toBeInTheDocument();
  });
});
