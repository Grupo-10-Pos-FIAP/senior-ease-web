import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { completeTask, getTask, listTasks } from '@app/composition/useCases'
import { DEMO_USER_ID } from '@shared/constants/user'

export const TASKS_QUERY_KEY = ['tasks', DEMO_USER_ID] as const

export function taskQueryKey(taskId: string) {
  return ['task', taskId] as const
}

export function useTasksQuery() {
  return useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => listTasks.execute(DEMO_USER_ID),
  })
}

export function useTaskQuery(taskId: string) {
  return useQuery({
    queryKey: taskQueryKey(taskId),
    queryFn: () => getTask.execute(taskId),
    enabled: Boolean(taskId),
  })
}

export function useCompleteTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (taskId: string) => completeTask.execute(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_QUERY_KEY })
    },
  })
}
