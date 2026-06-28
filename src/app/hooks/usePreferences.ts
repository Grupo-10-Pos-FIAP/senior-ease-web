import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPreferences, resetPreferences, updatePreferences } from "@app/composition/useCases";
import { useAuth } from "@app/providers/authContext";
import type { AccessibilityPreferences } from "@domain/entities/AccessibilityPreferences";

export function preferencesQueryKey(userId: string) {
  return ["preferences", userId] as const;
}

export function usePreferencesQuery() {
  const { user, status } = useAuth();
  const userId = user?.uid;

  return useQuery({
    queryKey: preferencesQueryKey(userId ?? "anonymous"),
    queryFn: () => {
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      return getPreferences.execute(userId);
    },
    enabled: status === "authenticated" && Boolean(userId),
  });
}

export function usePreferencesMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.uid;

  const saveMutation = useMutation({
    mutationFn: (preferences: AccessibilityPreferences) => {
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      return updatePreferences.execute(userId, preferences);
    },
    onSuccess: (data) => {
      if (userId) {
        queryClient.setQueryData(preferencesQueryKey(userId), data);
      }
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => {
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      return resetPreferences.execute(userId);
    },
    onSuccess: (data) => {
      if (userId) {
        queryClient.setQueryData(preferencesQueryKey(userId), data);
      }
    },
  });

  return { saveMutation, resetMutation };
}
