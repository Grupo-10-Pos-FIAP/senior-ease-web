import { useCallback, useEffect, useReducer, useState } from "react";
import {
  arePreferencesEqual,
  createDefaultPreferences,
  type AccessibilityPreferences,
} from "@domain/entities/AccessibilityPreferences";
import { usePreferencesMutations, usePreferencesQuery } from "@app/hooks/usePreferences";
import { useAccessibility } from "@app/providers/accessibilityContext";

type FormAction =
  | { type: "SET"; payload: Partial<AccessibilityPreferences> }
  | { type: "RESET"; payload: AccessibilityPreferences };

export type FormFeedback =
  { type: "success"; message: string } | { type: "error"; message: string };

function formReducer(
  state: AccessibilityPreferences,
  action: FormAction,
): AccessibilityPreferences {
  if (action.type === "RESET") {
    return action.payload;
  }
  return { ...state, ...action.payload };
}

export function usePersonalizationForm() {
  const { data: saved, isLoading } = usePreferencesQuery();
  const { saveMutation, resetMutation } = usePreferencesMutations();
  const { applyPreview } = useAccessibility();
  const [feedback, setFeedback] = useState<FormFeedback | null>(null);

  const [draft, dispatch] = useReducer(formReducer, saved ?? createDefaultPreferences());

  useEffect(() => {
    if (saved) {
      dispatch({ type: "RESET", payload: saved });
    }
  }, [saved]);

  useEffect(() => {
    applyPreview(draft);
  }, [draft, applyPreview]);

  const isDirty = saved ? !arePreferencesEqual(draft, saved) : false;

  const updateDraft = useCallback((changes: Partial<AccessibilityPreferences>) => {
    setFeedback(null);
    dispatch({ type: "SET", payload: changes });
  }, []);

  const save = useCallback(() => {
    setFeedback(null);
    saveMutation.mutate(draft, {
      onSuccess: () => {
        setFeedback({ type: "success", message: "Preferências salvas com sucesso." });
      },
      onError: () => {
        setFeedback({
          type: "error",
          message: "Não foi possível salvar suas preferências. Tente novamente.",
        });
      },
    });
  }, [draft, saveMutation]);

  const resetPersisted = useCallback(() => {
    resetMutation.mutate(undefined, {
      onSuccess: (defaults) => {
        dispatch({ type: "RESET", payload: defaults });
        setFeedback({ type: "success", message: "Configurações padrões restauradas." });
      },
      onError: () => {
        setFeedback({
          type: "error",
          message: "Não foi possível restaurar as configurações. Tente novamente.",
        });
      },
    });
  }, [resetMutation]);

  return {
    draft,
    isDirty,
    isLoading,
    isSaving: saveMutation.isPending,
    isResetting: resetMutation.isPending,
    feedback,
    updateDraft,
    save,
    resetPersisted,
  };
}
