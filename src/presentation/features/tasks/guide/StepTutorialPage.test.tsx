import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense } from "react";
import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import { AuthContext } from "@app/providers/authContext";
import { AccessibilityProvider } from "@app/providers/AccessibilityProvider";
import { ActivityGuidePage } from "@presentation/features/tasks/guide/ActivityGuidePage";
import { StepTutorialPage } from "@presentation/features/tasks/guide/StepTutorialPage";
import { resetTasksDb } from "@infrastructure/msw/db/tasks.db";
import { applyAccessibilityTokens } from "@shared/lib/accessibilityTokens";
import { DEMO_USER_ID } from "@shared/constants/user";

function renderGuideRoute(initialRoute: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const router = createMemoryRouter(
    [
      { path: "/tarefas/:id/guia/:stepId", element: <StepTutorialPage /> },
      { path: "/tarefas/:id/guia", element: <ActivityGuidePage /> },
    ],
    { initialEntries: [initialRoute] },
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: { uid: DEMO_USER_ID, email: "antoniojose@seniorease.com.br" },
          status: "authenticated",
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

async function waitForTutorialLoaded() {
  await waitFor(() => {
    expect(screen.queryByText(/carregando tutorial/i)).not.toBeInTheDocument();
  });
}

describe("StepTutorialPage", () => {
  beforeEach(() => {
    resetTasksDb();
    applyAccessibilityTokens(createDefaultPreferences());
  });

  it("renderiza tutorial de múltipla escolha com passos e simulação", async () => {
    renderGuideRoute("/tarefas/task-1/guia/step-1-2");
    await waitForTutorialLoaded();

    expect(
      screen.getByRole("heading", { level: 2, name: /quiz: hábitos seguros na internet/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/quiz de múltipla escolha/i)).toBeInTheDocument();
    expect(screen.getByText(/botões redondos/i)).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /pedir ajuda quando tiver dúvida/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /voltar para as tarefas/i })).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /confirmar que já aprendeu a escolher uma resposta/i }),
    ).toBeDisabled();
  });

  it("abre modal ao concluir prática de múltipla escolha", async () => {
    const user = userEvent.setup();
    renderGuideRoute("/tarefas/task-1/guia/step-1-2");
    await waitForTutorialLoaded();

    await user.click(screen.getByRole("radio", { name: /pedir ajuda quando tiver dúvida/i }));
    await user.click(
      screen.getByRole("button", { name: /confirmar que já aprendeu a escolher uma resposta/i }),
    );

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/o que você deseja fazer agora/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ir para a próxima tarefa/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /voltar para a lista de tarefas/i }),
    ).toBeInTheDocument();
  });

  it("renderiza tutorial do quiz de e-mail com radio buttons e exemplo sobre mensagem", async () => {
    const user = userEvent.setup();
    renderGuideRoute("/tarefas/task-2/guia/step-2-3");
    await waitForTutorialLoaded();

    expect(
      screen.getByRole("heading", { level: 2, name: /quiz: partes de uma mensagem/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/qual campo indica para quem você está enviando o e-mail/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /campo "para"/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /campo "assunto"/i })).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /campo "para"/i }));
    expect(screen.getByRole("radio", { name: /campo "para"/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /campo "assunto"/i })).not.toBeChecked();

    await user.click(screen.getByRole("radio", { name: /campo "assunto"/i }));
    expect(screen.getByRole("radio", { name: /campo "assunto"/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /campo "para"/i })).not.toBeChecked();
  });

  it("renderiza questão aberta com campo de resposta", async () => {
    renderGuideRoute("/tarefas/task-1/guia/step-1-3");
    await waitForTutorialLoaded();

    expect(
      screen.getByRole("heading", { level: 2, name: /reflexão: o que você quer aprender/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/sua resposta/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /voltar para as tarefas/i })).toHaveLength(2);
    expect(screen.getByRole("button", { name: /enviar resposta de exemplo/i })).toBeDisabled();
  });

  it("exibe leitura em tela cheia e modal ao terminar de ler", async () => {
    const user = userEvent.setup();
    renderGuideRoute("/tarefas/task-1/guia/step-1-1");
    await waitForTutorialLoaded();

    expect(
      screen.getByRole("heading", { level: 2, name: /conhecendo o mundo digital/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/leia o texto com calma, do começo ao fim/i),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /voltar para as tarefas/i }),
    ).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /confirmar que terminou de ler o texto/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/perfeito! na atividade real/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /confirmar que terminou de ler o texto/i }));

    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/quiz: hábitos seguros na internet/i)).toBeInTheDocument();
  });

  it("exibe vídeo em tela cheia com botão terminei de assistir", async () => {
    renderGuideRoute("/tarefas/task-1/guia/step-1-4");
    await waitForTutorialLoaded();

    expect(
      screen.getByRole("heading", { level: 2, name: /vídeo: navegando com segurança/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirmar que terminou de assistir ao vídeo/i }),
    ).toBeInTheDocument();
  });

  it("exibe link voltar para as tarefas no topo e na parte inferior", async () => {
    renderGuideRoute("/tarefas/task-1/guia/step-1-2");
    await waitForTutorialLoaded();

    const backLinks = screen.getAllByRole("link", { name: /voltar para as tarefas/i });
    expect(backLinks).toHaveLength(2);
    backLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/tarefas/task-1/guia");
    });
  });

  it("exibe mensagem quando tarefa não existe", async () => {
    renderGuideRoute("/tarefas/task-1/guia/step-inexistente");
    await waitForTutorialLoaded();

    expect(screen.getByRole("heading", { name: /tarefa não encontrada/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar para o guia/i })).toHaveAttribute(
      "href",
      "/tarefas/task-1/guia",
    );
  });
});
