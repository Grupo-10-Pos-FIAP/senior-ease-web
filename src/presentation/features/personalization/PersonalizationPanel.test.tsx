import { describe, expect, it, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import { PersonalizationPanel } from "@presentation/features/personalization/PersonalizationPanel";
import { resetPreferencesDb } from "@infrastructure/msw/db/preferences.db";
import { server } from "@infrastructure/msw/server";
import { applyAccessibilityTokens } from "@shared/lib/accessibilityTokens";
import { renderWithProviders } from "@shared/test/renderWithProviders";

async function findPanel() {
  await waitFor(() => {
    expect(screen.queryByText(/carregando preferências/i)).not.toBeInTheDocument();
  });
  const heading = screen.getByRole("heading", { name: /personalização da experiência/i });
  const panel = heading.closest(".personalization-panel");
  if (!panel) throw new Error("Panel not found");
  return panel as HTMLElement;
}

describe("PersonalizationPanel", () => {
  beforeEach(() => {
    resetPreferencesDb();
    localStorage.clear();
    applyAccessibilityTokens(createDefaultPreferences());
  });

  it("exibe título visível e texto introdutório", async () => {
    renderWithProviders(<PersonalizationPanel />);
    await findPanel();

    expect(screen.getByRole("heading", { name: /personalização da experiência/i })).toBeVisible();
    expect(screen.getByText(/as mudanças são mostradas na hora/i)).toBeInTheDocument();
  });

  it("agrupa cada preferência com role=group", async () => {
    renderWithProviders(<PersonalizationPanel />);
    const panel = await findPanel();

    const fieldsets = within(panel).getAllByRole("group");
    expect(fieldsets.length).toBeGreaterThanOrEqual(4);

    expect(within(panel).getByRole("group", { name: /tamanho da letra/i })).toBeInTheDocument();
    expect(within(panel).getByRole("group", { name: /nível de contraste/i })).toBeInTheDocument();
  });

  it("oferece rótulos descritivos nos controles de fonte", async () => {
    renderWithProviders(<PersonalizationPanel />);
    const panel = await findPanel();

    const fontSizeGroup = within(panel).getByRole("radiogroup", { name: /tamanho da letra/i });
    expect(
      within(fontSizeGroup).getByRole("radio", { name: /letra muito grande/i }),
    ).toBeInTheDocument();
    expect(
      within(fontSizeGroup).getByRole("radio", { name: /letra pequena/i }),
    ).toBeInTheDocument();
  });

  it("exibe banner de alterações não salvas somente no modo básico", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PersonalizationPanel />);
    const panel = await findPanel();

    const fontSizeGroup = within(panel).getByRole("radiogroup", { name: /tamanho da letra/i });
    await user.click(within(fontSizeGroup).getByRole("radio", { name: /letra grande/i }));

    expect(within(panel).queryByText(/alterações não salvas/i)).not.toBeInTheDocument();

    const modeGroup = within(panel).getByRole("radiogroup", { name: /modo de navegação/i });
    await user.click(within(modeGroup).getByRole("radio", { name: /modo básico/i }));

    expect(await within(panel).findByText(/alterações não salvas/i)).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: /salvar agora/i })).toBeInTheDocument();
  });

  it("Reset com confirmação ligada exige dialog", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PersonalizationPanel />);
    const panel = await findPanel();

    await user.click(
      within(panel).getByRole("button", { name: /retornar configurações padrões/i }),
    );

    expect(
      await screen.findByRole("alertdialog", { name: /restaurar configurações padrões/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /não, manter como está/i }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
  });

  it("Reset exige confirmação mesmo com preferência de confirmação desligada", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PersonalizationPanel />);
    const panel = await findPanel();

    const modeGroup = within(panel).getByRole("radiogroup", { name: /modo de navegação/i });
    await user.click(within(modeGroup).getByRole("radio", { name: /modo básico/i }));

    const confirmGroup = await within(panel).findByRole("radiogroup", {
      name: /confirmação em ações críticas/i,
    });
    await user.click(within(confirmGroup).getByRole("radio", { name: /^não$/i }));

    const fontSizeGroup = within(panel).getByRole("radiogroup", { name: /tamanho da letra/i });
    await user.click(within(fontSizeGroup).getByRole("radio", { name: /letra muito grande/i }));

    await user.click(within(panel).getByRole("button", { name: /salvar mudanças/i }));

    expect(
      await screen.findByRole("alertdialog", { name: /salvo com sucesso/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /entendi/i }));

    await waitFor(() => {
      expect(within(panel).getByRole("button", { name: /salvar mudanças/i })).toBeDisabled();
    });

    await user.click(
      within(panel).getByRole("button", { name: /retornar configurações padrões/i }),
    );

    expect(
      await screen.findByRole("alertdialog", { name: /restaurar configurações padrões/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /sim, restaurar padrões/i }));

    expect(
      await screen.findByRole("alertdialog", { name: /salvo com sucesso/i }),
    ).toHaveTextContent(/configurações padrões restauradas/i);

    await user.click(screen.getByRole("button", { name: /entendi/i }));

    await waitFor(() => {
      const group = within(panel).getByRole("radiogroup", { name: /tamanho da letra/i });
      expect(within(group).getByRole("radio", { name: /letra em tamanho normal/i })).toBeChecked();
    });
  });

  it("oculta opções de orientação no modo avançado", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PersonalizationPanel />);
    const panel = await findPanel();

    expect(
      within(panel).queryByRole("radiogroup", { name: /feedback visual reforçado/i }),
    ).not.toBeInTheDocument();
    expect(
      within(panel).queryByRole("radiogroup", { name: /confirmação em ações críticas/i }),
    ).not.toBeInTheDocument();

    const modeGroup = within(panel).getByRole("radiogroup", { name: /modo de navegação/i });
    await user.click(within(modeGroup).getByRole("radio", { name: /modo básico/i }));

    await waitFor(() => {
      expect(
        within(panel).getByRole("radiogroup", { name: /feedback visual reforçado/i }),
      ).toBeInTheDocument();
      expect(
        within(panel).getByRole("radiogroup", { name: /confirmação em ações críticas/i }),
      ).toBeInTheDocument();
    });
  });

  it("no modo avançado desliga feedback reforçado e confirmação crítica", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PersonalizationPanel />);
    const panel = await findPanel();

    const modeGroup = within(panel).getByRole("radiogroup", { name: /modo de navegação/i });
    await user.click(within(modeGroup).getByRole("radio", { name: /modo básico/i }));

    const feedbackGroup = await waitFor(() =>
      within(panel).getByRole("radiogroup", { name: /feedback visual reforçado/i }),
    );
    const confirmGroup = within(panel).getByRole("radiogroup", {
      name: /confirmação em ações críticas/i,
    });

    await user.click(within(feedbackGroup).getByRole("radio", { name: /^sim$/i }));
    await user.click(within(confirmGroup).getByRole("radio", { name: /^sim$/i }));

    await user.click(within(modeGroup).getByRole("radio", { name: /modo avançado/i }));

    await waitFor(() => {
      expect(
        within(panel).queryByRole("radiogroup", { name: /feedback visual reforçado/i }),
      ).not.toBeInTheDocument();
    });

    expect(document.documentElement.dataset.reinforcedFeedback).toBe("false");

    await user.click(within(modeGroup).getByRole("radio", { name: /modo básico/i }));

    await waitFor(() => {
      const feedback = within(panel).getByRole("radiogroup", {
        name: /feedback visual reforçado/i,
      });
      const confirm = within(panel).getByRole("radiogroup", {
        name: /confirmação em ações críticas/i,
      });
      expect(within(feedback).getByRole("radio", { name: /^não$/i })).toBeChecked();
      expect(within(confirm).getByRole("radio", { name: /^não$/i })).toBeChecked();
    });
  });

  it("descreve o modo básico como mais didático", async () => {
    renderWithProviders(<PersonalizationPanel />);
    const panel = await findPanel();

    expect(within(panel).getByText(/mais orientações e textos didáticos/i)).toBeInTheDocument();
    expect(within(panel).getByText(/interface fica mais enxuta/i)).toBeInTheDocument();
  });

  it("exibe mensagem de sucesso após salvar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<PersonalizationPanel />);
    const panel = await findPanel();

    const fontSizeGroup = within(panel).getByRole("radiogroup", { name: /tamanho da letra/i });
    await user.click(within(fontSizeGroup).getByRole("radio", { name: /letra grande/i }));

    await user.click(within(panel).getByRole("button", { name: /salvar mudanças/i }));

    expect(
      await screen.findByRole("alertdialog", { name: /salvo com sucesso/i }),
    ).toHaveTextContent(/preferências salvas com sucesso/i);

    await user.click(screen.getByRole("button", { name: /entendi/i }));

    await waitFor(() => {
      expect(within(panel).getByRole("button", { name: /salvar mudanças/i })).toBeDisabled();
    });
  });

  it("persiste via localStorage quando a API falha ao salvar", async () => {
    server.use(
      http.put("/api/users/:id/preferences", () =>
        HttpResponse.json({ message: "Erro interno" }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderWithProviders(<PersonalizationPanel />);
    const panel = await findPanel();

    const fontSizeGroup = within(panel).getByRole("radiogroup", { name: /tamanho da letra/i });
    await user.click(within(fontSizeGroup).getByRole("radio", { name: /letra grande/i }));

    await user.click(within(panel).getByRole("button", { name: /salvar mudanças/i }));

    expect(
      await screen.findByRole("alertdialog", { name: /salvo com sucesso/i }),
    ).toHaveTextContent(/preferências salvas com sucesso/i);
  });
});
