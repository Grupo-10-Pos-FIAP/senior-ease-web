import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeTask, getTask, listTasks } from "@app/composition/useCases";
import { useAuth } from "@app/providers/authContext";

export function tasksQueryKey(userId: string) {
  return ["tasks", userId] as const;
}

export function taskQueryKey(taskId: string) {
  return ["task", taskId] as const;
}

export function useTasksQuery() {
  const { user, status } = useAuth();
  const userId = user?.uid;

  return useQuery({
    queryKey: tasksQueryKey(userId ?? "anonymous"),
    queryFn: () => {
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      return listTasks.execute(userId);
    },
    enabled: status === "authenticated" && Boolean(userId),
  });
}

export function useTaskQuery(taskId: string) {
  const { status } = useAuth();

  return useQuery({
    queryKey: taskQueryKey(taskId),
    queryFn: () => getTask.execute(taskId),
    enabled: status === "authenticated" && Boolean(taskId),
  });
}

export function useCompleteTaskMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.uid;

  return useMutation({
    mutationFn: (taskId: string) => completeTask.execute(taskId),
    onSuccess: () => {
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: tasksQueryKey(userId) });
      }
    },
  });
}
