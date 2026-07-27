import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import {
  createAccessibilityPreferences,
  createDefaultPreferences,
} from "@domain/entities/AccessibilityPreferences";
import { AuthContext } from "@app/providers/authContext";
import { AccessibilityProvider } from "@app/providers/AccessibilityProvider";
import { ActivityStepPage } from "@presentation/features/tasks/execution/ActivityStepPage";
import { ActivityCompletedPage } from "@presentation/features/tasks/execution/ActivityCompletedPage";
import { TaskWizardEntry } from "@presentation/features/tasks/execution/TaskWizardEntry";
import { resetTasksDb, completeStepInDb } from "@infrastructure/msw/db/tasks.db";
import { resetPreferencesDb, updatePreferencesInDb } from "@infrastructure/msw/db/preferences.db";
import { toPreferencesDto } from "@infrastructure/mappers/preferences.mapper";
import { applyAccessibilityTokens } from "@shared/lib/accessibilityTokens";
import { DEMO_USER_ID } from "@shared/constants/user";

function setPreferences(partial: {
  interfaceMode?: "standard" | "simplified";
  confirmCriticalActions?: boolean;
}) {
  updatePreferencesInDb(DEMO_USER_ID, toPreferencesDto(createAccessibilityPreferences(partial)));
}

function setInterfaceMode(mode: "standard" | "simplified") {
  setPreferences({ interfaceMode: mode });
}

function renderExecutionRoute(initialRoute: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const router = createMemoryRouter(
    [
      { path: "/tarefas/:id", element: <TaskWizardEntry /> },
      { path: "/tarefas/:id/passo/:stepId", element: <ActivityStepPage /> },
      { path: "/tarefas/:id/concluida", element: <ActivityCompletedPage /> },
    ],
    { initialEntries: [initialRoute] },
  );

  render(
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

  return { router };
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
    resetPreferencesDb();
    applyAccessibilityTokens(createDefaultPreferences());
  });

  it("redireciona do wizard para o primeiro passo e exibe progresso", async () => {
    renderExecutionRoute("/tarefas/task-1");

    await waitFor(() => {
      expect(screen.getByText(/passo 1 de 4/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/passo 1 de 4/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /conhecendo o mundo digital/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: /mapa de questões/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /^próximo$/i,
      }),
    ).toBeInTheDocument();
  });

  it("usa Próximo como ação principal no modo simplificado", async () => {
    renderExecutionRoute("/tarefas/task-1/passo/step-1-1");
    await waitForStepLoaded();

    const forwardButton = screen.getByRole("button", {
      name: /^próximo$/i,
    });
    const exitButton = screen.getByRole("button", { name: /sair e voltar depois/i });

    expect(forwardButton.className).toContain("se-button--primary");
    expect(exitButton.className).toContain("se-button--secondary");
    expect(
      screen.queryByRole("button", { name: /confirmar que terminou de ler o texto/i }),
    ).not.toBeInTheDocument();
  });

  it("mantém textos longos de navegação no modo padrão", async () => {
    setInterfaceMode("simplified");
    renderExecutionRoute("/tarefas/task-1/passo/step-1-1");
    await waitForStepLoaded();

    expect(
      screen.getByRole("button", {
        name: /marcar leitura como concluída e ir para o próximo passo/i,
      }),
    ).toHaveTextContent("Próximo passo");
  });

  it("permite voltar ao passo 1 e avançar de novo para o passo em andamento", async () => {
    const user = userEvent.setup();
    renderExecutionRoute("/tarefas/task-1/passo/step-1-1");
    await waitForStepLoaded();

    await user.click(screen.getByRole("button", { name: /^próximo$/i }));

    await waitFor(() => {
      expect(screen.getByText(/passo 2 de 4/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /^anterior$/i }));

    await waitFor(() => {
      expect(screen.getByText(/passo 1 de 4/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /^próximo$/i }));

    await waitFor(() => {
      expect(screen.getByText(/passo 2 de 4/i)).toBeInTheDocument();
    });
  });

  it("salva resposta do quiz ao tocar em Próximo", async () => {
    const user = userEvent.setup();
    renderExecutionRoute("/tarefas/task-1/passo/step-1-1");
    await waitForStepLoaded();

    await user.click(screen.getByRole("button", { name: /^próximo$/i }));

    await waitFor(() => {
      expect(screen.getByText(/passo 2 de 4/i)).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole("radio", {
        name: /começar com uma tarefa simples e pedir ajuda de alguém de confiança/i,
      }),
    );
    await user.click(screen.getByRole("button", { name: /^próximo$/i }));

    await waitFor(() => {
      expect(screen.getByText(/passo 3 de 4/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /^anterior$/i }));
    await waitFor(() => {
      expect(screen.getByText(/passo 2 de 4/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole("radio", {
        name: /começar com uma tarefa simples e pedir ajuda de alguém de confiança/i,
      }),
    ).toBeChecked();
  });

  it("pede confirmação antes de sair e voltar depois no modo padrão", async () => {
    const user = userEvent.setup();
    setInterfaceMode("simplified");
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
    expect(screen.getByText(/passo 1 de 4/i)).toBeInTheDocument();
  });

  it("conclui leitura e avança para o próximo passo", async () => {
    const user = userEvent.setup();
    renderExecutionRoute("/tarefas/task-1/passo/step-1-1");
    await waitForStepLoaded();

    await user.click(screen.getByRole("button", { name: /^próximo$/i }));

    await waitFor(() => {
      expect(screen.getByText(/passo 2 de 4/i)).toBeInTheDocument();
    });
  });

  it("no modo simplificado conclui a atividade sem confirmação", async () => {
    const user = userEvent.setup();
    completeStepInDb("task-1", "step-1-1", DEMO_USER_ID);
    completeStepInDb("task-1", "step-1-2", DEMO_USER_ID, "b");
    completeStepInDb("task-1", "step-1-3", DEMO_USER_ID, "Quero aprender e-mail");

    renderExecutionRoute("/tarefas/task-1/passo/step-1-4");
    await waitForStepLoaded();

    await user.click(
      screen.getByRole("button", { name: /salvar resposta e concluir a atividade/i }),
    );

    expect(
      screen.queryByRole("alertdialog", { name: /concluir esta atividade/i }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /parabéns! você concluiu a atividade/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      /parabéns! você foi muito bem\. continue assim!/i,
    );
    expect(
      screen.getByText(/parabéns! você respondeu corretamente\.\s*continue assim!/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^sua resposta$/i })).toBeInTheDocument();
    expect(
      screen.getByText(/pergunta: serviços públicos e bancos estão cada vez mais no celular/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /sua resposta: começar com uma tarefa simples e pedir ajuda de alguém de confiança/i,
      ),
    ).toBeInTheDocument();
  });

  it("mostra na conclusão feedback acolhedor ao errar, sem contar erros", async () => {
    completeStepInDb("task-1", "step-1-1", DEMO_USER_ID);
    completeStepInDb("task-1", "step-1-2", DEMO_USER_ID, "a");
    completeStepInDb("task-1", "step-1-3", DEMO_USER_ID, "Quero aprender e-mail");
    completeStepInDb("task-1", "step-1-4", DEMO_USER_ID);

    renderExecutionRoute("/tarefas/task-1/concluida");

    expect(
      await screen.findByRole("heading", {
        name: /você concluiu a atividade\. veja seu resultado\./i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /parabéns! você concluiu a atividade/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      /veja abaixo como foi a pergunta\. o importante é aprender\./i,
    );
    expect(screen.getByRole("status")).not.toHaveTextContent(/errou/i);
    expect(
      screen.getByText(/a resposta não foi a correta\. não tem problema!/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/próxima vez/i)).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^sua resposta$/i })).toBeInTheDocument();
    expect(
      screen.getByText(/pergunta: serviços públicos e bancos estão cada vez mais no celular/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/sua resposta: tentar aprender tudo de uma vez sem pausa/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /resposta certa: começar com uma tarefa simples e pedir ajuda de alguém de confiança/i,
      ),
    ).toBeInTheDocument();
  });

  it("ao trocar de atividade concluída não mantém o resultado anterior", async () => {
    completeStepInDb("task-1", "step-1-1", DEMO_USER_ID);
    completeStepInDb("task-1", "step-1-2", DEMO_USER_ID, "a");
    completeStepInDb("task-1", "step-1-3", DEMO_USER_ID, "Quero aprender e-mail");
    completeStepInDb("task-1", "step-1-4", DEMO_USER_ID);

    completeStepInDb("task-2", "step-2-1", DEMO_USER_ID);
    completeStepInDb("task-2", "step-2-2", DEMO_USER_ID);
    completeStepInDb("task-2", "step-2-3", DEMO_USER_ID, "c");

    const { router } = renderExecutionRoute("/tarefas/task-1/concluida");

    expect(
      await screen.findByRole("heading", {
        name: /você concluiu a atividade\. veja seu resultado\./i,
      }),
    ).toBeInTheDocument();

    await router.navigate("/tarefas/task-2/concluida");

    expect(
      await screen.findByRole("heading", { name: /parabéns! você concluiu a atividade/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", {
        name: /você concluiu a atividade\. veja seu resultado\./i,
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/como usar o e-mail/i)).toBeInTheDocument();
  });

  it("no modo padrão pede confirmação ao concluir quando a preferência está ligada", async () => {
    const user = userEvent.setup();
    setPreferences({ interfaceMode: "simplified", confirmCriticalActions: true });
    completeStepInDb("task-1", "step-1-1", DEMO_USER_ID);
    completeStepInDb("task-1", "step-1-2", DEMO_USER_ID, "b");
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
    expect(screen.getByText(/passo 4 de 4/i)).toBeInTheDocument();
  });

  it("no modo padrão conclui sem confirmação quando a preferência está desligada", async () => {
    const user = userEvent.setup();
    setPreferences({ interfaceMode: "simplified", confirmCriticalActions: false });
    completeStepInDb("task-1", "step-1-1", DEMO_USER_ID);
    completeStepInDb("task-1", "step-1-2", DEMO_USER_ID, "b");
    completeStepInDb("task-1", "step-1-3", DEMO_USER_ID, "Quero aprender e-mail");

    renderExecutionRoute("/tarefas/task-1/passo/step-1-4");
    await waitForStepLoaded();

    await user.click(
      screen.getByRole("button", { name: /salvar resposta e concluir a atividade/i }),
    );

    expect(
      screen.queryByRole("alertdialog", { name: /concluir esta atividade/i }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: /parabéns! você concluiu a atividade/i }),
    ).toBeInTheDocument();
  });
});
