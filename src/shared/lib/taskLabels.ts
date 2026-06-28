import type { TaskStatus } from '@domain/entities/Task'

export const ACTIVITY_TAB_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'active', label: 'Minhas atividades' },
  { value: 'completed', label: 'Atividades concluídas' },
  { value: 'expired', label: 'Atividades expiradas' },
]

export const EMPTY_STATE_MESSAGES: Record<TaskStatus, string> = {
  active: 'Você não tem atividades pendentes no momento.',
  completed: 'Ainda não há atividades concluídas.',
  expired: 'Não há atividades expiradas.',
}
