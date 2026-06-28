import { describe, expect, it, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { AccessibilityPreferences } from "@domain/entities/AccessibilityPreferences";
import { usePersonalizationForm } from "@presentation/hooks/usePersonalizationForm";

const defaultPreferences: AccessibilityPreferences = {
  fontSize: 3,
  contrast: 3,
  spacing: 3,
  interfaceMode: "standard",
  reinforcedVisualFeedback: true,
  confirmCriticalActions: true,
};

const { mutateMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
}));

vi.mock("@app/hooks/usePreferences", () => ({
  usePreferencesQuery: () => ({
    data: defaultPreferences,
    isLoading: false,
  }),
  usePreferencesMutations: () => ({
    saveMutation: {
      mutate: mutateMock,
      isPending: false,
    },
    resetMutation: {
      mutate: vi.fn(),
      isPending: false,
    },
  }),
}));

vi.mock("@app/providers/accessibilityContext", () => ({
  useAccessibility: () => ({
    applyPreview: vi.fn(),
  }),
}));

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe("usePersonalizationForm", () => {
  it("define feedback de erro quando save falha", async () => {
    mutateMock.mockImplementation((_draft: unknown, options?: { onError?: () => void }) => {
      options?.onError?.();
    });

    const { result } = renderHook(() => usePersonalizationForm(), { wrapper });

    act(() => {
      result.current.updateDraft({ fontSize: 4 });
    });

    act(() => {
      result.current.save();
    });

    await waitFor(() => {
      expect(result.current.feedback).toEqual({
        type: "error",
        message: "Não foi possível salvar suas preferências. Tente novamente.",
      });
    });
  });
});
