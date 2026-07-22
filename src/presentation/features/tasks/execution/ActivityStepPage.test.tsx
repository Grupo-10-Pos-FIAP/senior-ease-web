import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import { AuthContext } from "@app/providers/authContext";
import { AccessibilityProvider } from "@app/providers/AccessibilityProvider";
import { ActivityStepPage } from "@presentation/features/tasks/execution/ActivityStepPage";
import { TaskWizardEntry } from "@presentation/features/tasks/execution/TaskWizardEntry";
import { resetTasksDb, completeStepInDb } from "@infrastructure/msw/db/tasks.db";
import { applyAccessibilityTokens } from "@shared/lib/accessibilityTokens";
import { DEMO_USER_ID } from "@shared/constants/user";

function renderExecutionRoute(initialRoute: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const router = createMemoryRouter(
    [
      { path: "/tarefas/:id", element: <TaskWizardEntry /> },
      { path: "/tarefas/:id/passo/:stepId", element: <ActivityStepPage /> },
    ],
    { initialEntries: [initialRoute] },
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: { uid: DEMO_USER_ID, email: "antoniojose@seniorease.com.br" },
          status: "authenticated",
          refreshSession: () => Promise.resolve(),
        }}
      >
        <AccessibilityProvider>
          <Suspense fallback={<p>Carregando…</p>}>
            <RouterProvider router={router} />
          </Suspense>
        </AccessibilityProvider>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

async function waitForStepLoaded() {
  await waitFor(() => {
    expect(screen.queryByText(/carregando atividade/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/preparando sua atividade/i)).not.toBeInTheDocument();
  });
}

describe("Activity execution", () => {
  beforeEach(() => {
    resetTasksDb();
    applyAccessibilityTokens(createDefaultPreferences());
  });

  it("redireciona do wizard para o primeiro passo e exibe progresso", async () => {
    renderExecutionRoute("/tarefas/task-1");

    await waitFor(() => {
      expect(screen.getByText(/questão 1 de 4/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/questão 1 de 4/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /conhecendo o mundo digital/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: /mapa de questões/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /marcar leitura como concluída e ir para a próxima pergunta/i,
      }),
    ).toBeInTheDocument();
  });

  it("usa Próxima pergunta como ação principal para salvar e avançar", async () => {
    renderExecutionRoute("/tarefas/task-1/passo/step-1-1");
    await waitForStepLoaded();

    const forwardButton = screen.getByRole("button", {
      name: /marcar leitura como concluída e ir para a próxima pergunta/i,
    });
    const exitButton = screen.getByRole("button", { name: /sair e voltar depois/i });

    expect(forwardButton.className).toContain("se-button--primary");
    expect(exitButton.className).toContain("se-button--secondary");
    expect(
      screen.queryByRole("button", { name: /confirmar que terminou de ler o texto/i }),
    ).not.toBeInTheDocument();
  });

  it("permite voltar à questão 1 e avançar de novo para a questão em andamento", async () => {
    const user = userEvent.setup();
    renderExecutionRoute("/tarefas/task-1/passo/step-1-1");
    await waitForStepLoaded();

    await user.click(
      screen.getByRole("button", {
        name: /marcar leitura como concluída e ir para a próxima pergunta/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText(/questão 2 de 4/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /ir para a pergunta anterior/i }));

    await waitFor(() => {
      expect(screen.getByText(/questão 1 de 4/i)).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("button", {
        name: /marcar leitura como concluída e ir para a próxima pergunta/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText(/questão 2 de 4/i)).toBeInTheDocument();
    });
  });

  it("salva resposta do quiz ao tocar em Próxima pergunta", async () => {
    const user = userEvent.setup();
    renderExecutionRoute("/tarefas/task-1/passo/step-1-1");
    await waitForStepLoaded();

    await user.click(
      screen.getByRole("button", {
        name: /marcar leitura como concluída e ir para a próxima pergunta/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText(/questão 2 de 4/i)).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("radio", {
        name: /começar com uma tarefa simples e pedir ajuda de alguém de confiança/i,
      }),
    );
    await user.click(
      screen.getByRole("button", {
        name: /salvar resposta escolhida e ir para a próxima pergunta/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText(/questão 3 de 4/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /ir para a pergunta anterior/i }));
    await waitFor(() => {
      expect(screen.getByText(/questão 2 de 4/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("radio", {
        name: /começar com uma tarefa simples e pedir ajuda de alguém de confiança/i,
      }),
    ).toBeChecked();
  });

  it("pede confirmação antes de sair e voltar depois", async () => {
    const user = userEvent.setup();
    renderExecutionRoute("/tarefas/task-1/passo/step-1-1");
    await waitForStepLoaded();

    await user.click(screen.getByRole("button", { name: /sair e voltar depois/i }));

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/seu progresso ficará salvo/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sim, sair agora/i }).className).toContain(
      "se-button--warning-filled",
    );

    await user.click(screen.getByRole("button", { name: /não, continuar na atividade/i }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByText(/questão 1 de 4/i)).toBeInTheDocument();
  });

  it("conclui leitura e avança para a próxima pergunta", async () => {
    const user = userEvent.setup();
    renderExecutionRoute("/tarefas/task-1/passo/step-1-1");
    await waitForStepLoaded();

    await user.click(
      screen.getByRole("button", {
        name: /marcar leitura como concluída e ir para a próxima pergunta/i,
      }),
    );

    await waitFor(() => {
      expect(screen.getByText(/questão 2 de 4/i)).toBeInTheDocument();
    });
  });

  it("pede confirmação antes de concluir a atividade", async () => {
    const user = userEvent.setup();
    completeStepInDb("task-1", "step-1-1", DEMO_USER_ID);
    completeStepInDb("task-1", "step-1-2", DEMO_USER_ID, "a");
    completeStepInDb("task-1", "step-1-3", DEMO_USER_ID, "Quero aprender e-mail");

    renderExecutionRoute("/tarefas/task-1/passo/step-1-4");
    await waitForStepLoaded();

    await user.click(
      screen.getByRole("button", { name: /salvar resposta e concluir a atividade/i }),
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/não poderá refazer esta atividade/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sim, concluir atividade/i }).className).toContain(
      "se-button--success-filled",
    );

    await user.click(screen.getByRole("button", { name: /não, continuar na atividade/i }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByText(/questão 4 de 4/i)).toBeInTheDocument();
  });
});
