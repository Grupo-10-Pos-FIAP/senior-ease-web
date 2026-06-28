import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getPreferences, resetPreferences, updatePreferences } from "@app/composition/useCases";
import type { AccessibilityPreferences } from "@domain/entities/AccessibilityPreferences";
import { DEMO_USER_ID } from "@shared/constants/user";

export const PREFERENCES_QUERY_KEY = ["preferences", DEMO_USER_ID] as const;

export function usePreferencesQuery() {
  return useQuery({
    queryKey: PREFERENCES_QUERY_KEY,
    queryFn: () => getPreferences.execute(DEMO_USER_ID),
  });
}

export function usePreferencesMutations() {
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (preferences: AccessibilityPreferences) =>
      updatePreferences.execute(DEMO_USER_ID, preferences),
    onSuccess: (data) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, data);
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => resetPreferences.execute(DEMO_USER_ID),
    onSuccess: (data) => {
      queryClient.setQueryData(PREFERENCES_QUERY_KEY, data);
    },
  });

  return { saveMutation, resetMutation };
}
