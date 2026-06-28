import { describe, expect, it } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AccessibilityProvider } from "@app/providers/AccessibilityProvider";
import { AppLayout } from "@presentation/layouts/AppLayout";
import { DashboardPage } from "@presentation/pages/DashboardPage";
import { ProfilePage } from "@presentation/pages/ProfilePage";
import { PersonalizationPanel } from "@presentation/features/personalization/PersonalizationPanel";

function renderApp(initialRoute = "/") {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: "perfil",
            element: <ProfilePage />,
            children: [{ path: "personalizacao", element: <PersonalizationPanel /> }],
          },
        ],
      },
    ],
    { initialEntries: [initialRoute] },
  );

  return render(
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <Suspense fallback={<p>Carregando…</p>}>
          <RouterProvider router={router} />
        </Suspense>
      </AccessibilityProvider>
    </QueryClientProvider>,
  );
}

describe("ProfilePage", () => {
  it("navega para Personalização via Meu perfil e salva mudanças", async () => {
    const user = userEvent.setup();
    renderApp("/");

    const nav = await screen.findByRole("navigation", { name: /navegação principal/i });
    await user.click(within(nav).getByRole("link", { name: /^meu perfil$/i }));

    expect(await screen.findByRole("tablist", { name: /seções do perfil/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /personalização/i })).toBeInTheDocument();

    const saveButton = await screen.findByRole("button", { name: /salvar mudanças/i });
    expect(saveButton).toBeDisabled();

    const fontSizeGroup = screen.getByRole("radiogroup", { name: /tamanho da letra/i });
    await user.click(within(fontSizeGroup).getByRole("radio", { name: /letra muito grande/i }));
    expect(saveButton).toBeEnabled();

    await user.click(saveButton);

    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue("--se-font-size")).toBe("1.25rem");
    });
  });
});
