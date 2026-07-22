import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deactivateUser, getUser, updateUser } from "@app/composition/useCases";
import { useAuth } from "@app/providers/authContext";
import { UserNotFoundError } from "@domain/errors/UserNotFoundError";
import type { UserUpdateInput } from "@domain/repositories/IUserRepository";

export function userQueryKey(userId: string) {
  return ["user", userId] as const;
}

export function useUserQuery() {
  const { user, status } = useAuth();
  const userId = user?.uid;

  return useQuery({
    queryKey: userQueryKey(userId ?? "anonymous"),
    queryFn: () => {
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      return getUser.execute(userId);
    },
    enabled: status === "authenticated" && Boolean(userId),
    retry: (failureCount, error) => error instanceof UserNotFoundError && failureCount < 5,
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4000),
  });
}

export function useUserMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.uid;

  const updateMutation = useMutation({
    mutationFn: (input: UserUpdateInput) => {
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      return updateUser.execute(userId, input);
    },
    onSuccess: (data) => {
      if (userId) {
        queryClient.setQueryData(userQueryKey(userId), data);
      }
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: () => {
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      return deactivateUser.execute(userId);
    },
    onSuccess: () => {
      if (userId) {
        queryClient.removeQueries({ queryKey: userQueryKey(userId) });
      }
    },
  });

  return { updateMutation, deactivateMutation };
}
