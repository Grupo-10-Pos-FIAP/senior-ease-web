import { describe, expect, it, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createAccessibilityPreferences,
  createDefaultPreferences,
} from "@domain/entities/AccessibilityPreferences";
import { AccessibilityProvider } from "@app/providers/AccessibilityProvider";
import { AuthContext } from "@app/providers/authContext";
import { AccountInfoTab } from "@presentation/features/profile/AccountInfoTab";
import { DashboardPage } from "@presentation/pages/DashboardPage";
import { resetUserDb } from "@infrastructure/msw/db/user.db";
import { updatePreferencesInDb } from "@infrastructure/msw/db/preferences.db";
import { toPreferencesDto } from "@infrastructure/mappers/preferences.mapper";
import { applyAccessibilityTokens } from "@shared/lib/accessibilityTokens";
import { renderWithProviders } from "@shared/test/renderWithProviders";

async function findAccountTab() {
  await waitFor(() => {
    expect(screen.queryByText(/carregando informações/i)).not.toBeInTheDocument();
  });
  const heading = screen.getByRole("heading", { name: /informações da conta/i });
  const tab = heading.closest(".account-info-tab");
  if (!tab) throw new Error("Account tab not found");
  return tab as HTMLElement;
}

function renderAccountApp(initialRoute = "/perfil/conta") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const router = createMemoryRouter(
    [
      { path: "/", element: <DashboardPage /> },
      { path: "/perfil/conta", element: <AccountInfoTab /> },
    ],
    { initialEntries: [initialRoute] },
  );

  return {
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider
          value={{
            user: { uid: "demo-user", email: "antoniojose@seniorease.com.br" },
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
    ),
  };
}

describe("AccountInfoTab", () => {
  beforeEach(() => {
    resetUserDb();
    applyAccessibilityTokens(createDefaultPreferences());
  });

  it("exibe dados do usuário demo após carregar", async () => {
    renderWithProviders(<AccountInfoTab />);
    const tab = await findAccountTab();

    expect(within(tab).getByText("Antônio José Maria da Silva")).toBeInTheDocument();
    expect(within(tab).getByText("67 anos")).toBeInTheDocument();
    expect(within(tab).getByText("2026067")).toBeInTheDocument();
    expect(within(tab).getByText("Baixa visão")).toBeInTheDocument();
    expect(within(tab).getByText("antoniojose@seniorease.com.br")).toBeInTheDocument();
    expect(within(tab).getByText("(85) 96767-6767")).toBeInTheDocument();
  });

  it("abre formulário ao clicar em Editar informações", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountInfoTab />);
    const tab = await findAccountTab();

    await user.click(within(tab).getByRole("button", { name: /editar informações/i }));

    expect(within(tab).getByLabelText(/nome completo/i)).toHaveValue("Antônio José Maria da Silva");
    expect(within(tab).getByLabelText(/data de nascimento/i)).toHaveValue("15/01/1959");
    expect(within(tab).getByRole("button", { name: /salvar informações/i })).toBeInTheDocument();
  });

  it("salva alterações via PATCH", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountInfoTab />);
    const tab = await findAccountTab();

    await user.click(within(tab).getByRole("button", { name: /editar informações/i }));

    const nameInput = within(tab).getByLabelText(/nome completo/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Maria Souza");

    await user.click(within(tab).getByRole("button", { name: /salvar informações/i }));

    expect(
      await screen.findByRole("alertdialog", { name: /salvo com sucesso/i }),
    ).toHaveTextContent(/informações salvas com sucesso/i);
    expect(within(tab).getByText("Maria Souza")).toBeInTheDocument();
    expect(within(tab).queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
  });

  it("cancelar descarta alterações", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountInfoTab />);
    const tab = await findAccountTab();

    await user.click(within(tab).getByRole("button", { name: /editar informações/i }));

    const nameInput = within(tab).getByLabelText(/nome completo/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Nome temporário");

    await user.click(within(tab).getByRole("button", { name: /não, manter como está/i }));

    expect(within(tab).getByText("Antônio José Maria da Silva")).toBeInTheDocument();
    expect(within(tab).queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
  });

  it("exibe erro acessível para e-mail inválido", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AccountInfoTab />);
    const tab = await findAccountTab();

    await user.click(within(tab).getByRole("button", { name: /editar informações/i }));

    const emailInput = within(tab).getByLabelText(/e-mail/i);
    await user.clear(emailInput);
    await user.type(emailInput, "email-invalido");

    await user.click(within(tab).getByRole("button", { name: /salvar informações/i }));

    const error = await within(tab).findByRole("alert");
    expect(error).toHaveTextContent(/e-mail/i);
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  it("deletar conta com confirmação exige dialog e redireciona", async () => {
    const user = userEvent.setup();
    const { router } = renderAccountApp();

    const tab = await findAccountTab();

    await user.click(within(tab).getByRole("button", { name: /deletar conta/i }));

    expect(
      await screen.findByRole("alertdialog", { name: /excluir conta permanentemente/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sim, excluir minha conta/i }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });

    expect(
      await screen.findByRole("alertdialog", { name: /conta excluída/i }),
    ).toHaveTextContent(/conta foi excluída permanentemente/i);
  });

  it("deletar conta exige confirmação mesmo com preferência desligada", async () => {
    const user = userEvent.setup();
    updatePreferencesInDb(
      "demo-user",
      toPreferencesDto(createAccessibilityPreferences({ confirmCriticalActions: false })),
    );

    const { router } = renderAccountApp();
    const tab = await findAccountTab();

    await user.click(within(tab).getByRole("button", { name: /deletar conta/i }));

    expect(
      await screen.findByRole("alertdialog", { name: /excluir conta permanentemente/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sim, excluir minha conta/i }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/");
    });

    expect(
      await screen.findByRole("alertdialog", { name: /conta excluída/i }),
    ).toBeInTheDocument();
  });
});
