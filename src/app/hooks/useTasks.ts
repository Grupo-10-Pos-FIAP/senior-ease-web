import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeGuideStep,
  completeTaskStep,
  getTask,
  listTasks,
  startActivity,
  updateCurrentStep,
} from "@app/composition/useCases";
import { useAuth } from "@app/providers/authContext";
import type { StepCompletionPayload } from "@domain/value-objects/ActivityStepContent";

export function tasksQueryKey(userId: string) {
  return ["tasks", userId] as const;
}

export function taskQueryKey(taskId: string) {
  return ["task", taskId] as const;
}

function useInvalidateTasks() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.uid;

  return (taskId?: string) => {
    if (userId) {
      void queryClient.invalidateQueries({ queryKey: tasksQueryKey(userId) });
    }
    if (taskId) {
      void queryClient.invalidateQueries({ queryKey: taskQueryKey(taskId) });
    }
  };
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

export function useStartActivityMutation() {
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: ({ taskId, stepId }: { taskId: string; stepId: string }) =>
      startActivity.execute(taskId, stepId),
    onSuccess: (_data, { taskId }) => {
      invalidate(taskId);
    },
  });
}

export function useCompleteStepMutation() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: ({
      taskId,
      stepId,
      payload,
    }: {
      taskId: string;
      stepId: string;
      payload?: StepCompletionPayload;
    }) => completeTaskStep.execute(taskId, stepId, payload),
    onSuccess: (data, { taskId }) => {
      queryClient.setQueryData(taskQueryKey(taskId), data);
      invalidate(taskId);
    },
  });
}

export function useCompleteGuideStepMutation() {
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: ({ taskId, stepId }: { taskId: string; stepId: string }) =>
      completeGuideStep.execute(taskId, stepId),
    onSuccess: (_data, { taskId }) => {
      invalidate(taskId);
    },
  });
}

export function useUpdateCurrentStepMutation() {
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: ({ taskId, stepId }: { taskId: string; stepId: string }) =>
      updateCurrentStep.execute(taskId, stepId),
    onSuccess: (_data, { taskId }) => {
      invalidate(taskId);
    },
  });
}
