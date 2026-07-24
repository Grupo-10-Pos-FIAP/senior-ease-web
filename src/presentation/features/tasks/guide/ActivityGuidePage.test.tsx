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
import { ActivityGuidePage } from "@presentation/features/tasks/guide/ActivityGuidePage";
import { StepTutorialPage } from "@presentation/features/tasks/guide/StepTutorialPage";
import { TaskWizardEntry } from "@presentation/features/tasks/execution/TaskWizardEntry";
import { ActivityStepPage } from "@presentation/features/tasks/execution/ActivityStepPage";
import { resetTasksDb } from "@infrastructure/msw/db/tasks.db";
import { resetPreferencesDb, updatePreferencesInDb } from "@infrastructure/msw/db/preferences.db";
import { toPreferencesDto } from "@infrastructure/mappers/preferences.mapper";
import { applyAccessibilityTokens } from "@shared/lib/accessibilityTokens";
import { DEMO_USER_ID } from "@shared/constants/user";
import {
  GUIDE_STEP_ACTION_LABEL,
  GUIDE_STEP_ACTION_LABEL_ADVANCED,
} from "@shared/lib/taskStepLabels";

function setInterfaceMode(mode: "standard" | "simplified") {
  updatePreferencesInDb(
    DEMO_USER_ID,
    toPreferencesDto(createAccessibilityPreferences({ interfaceMode: mode })),
  );
}

function renderGuideRoute(initialRoute: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const router = createMemoryRouter(
    [
      { path: "/tarefas/:id/guia/:stepId", element: <StepTutorialPage /> },
      { path: "/tarefas/:id/guia", element: <ActivityGuidePage /> },
      { path: "/tarefas/:id/passo/:stepId", element: <ActivityStepPage /> },
      { path: "/tarefas/:id", element: <TaskWizardEntry /> },
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

async function waitForGuideLoaded() {
  await waitFor(() => {
    expect(screen.queryByText(/carregando guia da atividade/i)).not.toBeInTheDocument();
  });
}

describe("ActivityGuidePage", () => {
  beforeEach(() => {
    resetTasksDb();
    resetPreferencesDb();
    applyAccessibilityTokens(createDefaultPreferences());
  });

  it("lista tarefas da atividade com posição e badges de tipo", async () => {
    renderGuideRoute("/tarefas/task-1/guia");
    await waitForGuideLoaded();

    expect(
      screen.getByRole("heading", { name: /como fazer: oficina "primeiros passos no digital"/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /tarefas desta atividade/i })).toBeInTheDocument();

    expect(screen.getByText("Tarefa 1 de 4")).toBeInTheDocument();
    expect(screen.getByText("Conhecendo o mundo digital")).toBeInTheDocument();
    expect(screen.getByText("Quiz: hábitos seguros na internet")).toBeInTheDocument();
    expect(screen.getByText("Reflexão: o que você quer aprender?")).toBeInTheDocument();
    expect(screen.getByText("Vídeo: navegando com segurança")).toBeInTheDocument();

    expect(screen.getByText("Leitura de conteúdo")).toBeInTheDocument();
    expect(screen.getByText("Múltipla escolha")).toBeInTheDocument();
    expect(screen.getByText("Questão aberta")).toBeInTheDocument();
    expect(screen.getByText("Assistir conteúdo")).toBeInTheDocument();
  });

  it("exibe botão como fazer em cada item no modo avançado", async () => {
    renderGuideRoute("/tarefas/task-1/guia");
    await waitForGuideLoaded();

    const actionLinks = screen.getAllByRole("link", { name: /^como fazer\?:/i });
    expect(actionLinks).toHaveLength(4);
    expect(actionLinks[0]).toHaveAttribute("href", "/tarefas/task-1/guia/step-1-1");
    expect(actionLinks[1]).toHaveAttribute("href", "/tarefas/task-1/guia/step-1-2");
    expect(actionLinks[2]).toHaveAttribute("href", "/tarefas/task-1/guia/step-1-3");
    expect(actionLinks[3]).toHaveAttribute("href", "/tarefas/task-1/guia/step-1-4");
    expect(actionLinks[0]).toHaveTextContent(GUIDE_STEP_ACTION_LABEL_ADVANCED);
  });

  it("exibe textos longos do guia no modo básico", async () => {
    setInterfaceMode("simplified");
    renderGuideRoute("/tarefas/task-1/guia");
    await waitForGuideLoaded();

    const actionLinks = screen.getAllByRole("link", { name: /como fazer esta tarefa\?:/i });
    expect(actionLinks).toHaveLength(4);
    expect(actionLinks[0]).toHaveTextContent(GUIDE_STEP_ACTION_LABEL);
    expect(screen.getByRole("link", { name: /voltar para minhas atividades/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("exibe ações de voltar e iniciar atividade", async () => {
    renderGuideRoute("/tarefas/task-1/guia");
    await waitForGuideLoaded();

    expect(screen.getByRole("link", { name: /^voltar$/i })).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("button", {
        name: /^iniciar: oficina "primeiros passos no digital"$/i,
      }),
    ).toBeInTheDocument();
  });

  it("no modo avançado inicia a atividade no guia sem confirmação", async () => {
    const user = userEvent.setup();
    renderGuideRoute("/tarefas/task-1/guia");
    await waitForGuideLoaded();

    await user.click(
      screen.getByRole("button", {
        name: /^iniciar: oficina "primeiros passos no digital"$/i,
      }),
    );

    expect(
      screen.queryByRole("alertdialog", { name: /iniciar esta atividade/i }),
    ).not.toBeInTheDocument();
  });

  it("lista quiz de e-mail no curso como usar e-mail", async () => {
    renderGuideRoute("/tarefas/task-2/guia");
    await waitForGuideLoaded();

    expect(
      screen.getByRole("heading", { name: /como fazer: curso "como usar e-mail"/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Quiz: partes de uma mensagem")).toBeInTheDocument();
    expect(screen.getByText("Múltipla escolha")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /como fazer\?: quiz: partes de uma mensagem/i }),
    ).toHaveAttribute("href", "/tarefas/task-2/guia/step-2-3");
  });
});
