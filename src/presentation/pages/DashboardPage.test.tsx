import { describe, expect, it, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { createDefaultPreferences } from "@domain/entities/AccessibilityPreferences";
import { DashboardPage } from "@presentation/pages/DashboardPage";
import { resetTasksDb } from "@infrastructure/msw/db/tasks.db";
import { applyAccessibilityTokens } from "@shared/lib/accessibilityTokens";
import { renderWithProviders } from "@shared/test/renderWithProviders";

describe("DashboardPage", () => {
  beforeEach(() => {
    resetTasksDb();
    applyAccessibilityTokens(createDefaultPreferences());
  });

  it("renderiza a lista de atividades na home", async () => {
    renderWithProviders(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByText(/carregando atividades/i)).not.toBeInTheDocument();
    });

    expect(screen.getByRole("tab", { name: /minhas atividades/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /como usar e-mail/i })).toBeInTheDocument();
  });
});
