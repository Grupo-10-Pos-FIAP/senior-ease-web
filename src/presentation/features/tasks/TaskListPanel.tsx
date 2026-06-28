import { useMemo, useState } from 'react'
import type { Task, TaskStatus } from '@domain/entities/Task'
import { ActivityCard, ActivityTabs, ConfirmDialog } from '@shared/ui'
import { useCompleteTaskMutation, useTasksQuery } from '@app/hooks/useTasks'
import { useConfirmCriticalAction } from '@presentation/hooks/useConfirmCriticalAction'
import { ACTIVITY_TAB_OPTIONS, EMPTY_STATE_MESSAGES } from '@shared/lib/taskLabels'
import './TaskListPanel.css'

function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status)
}

function TaskListContent({
  status,
  tasks,
  isLoading,
  isError,
  completingTaskId,
  onComplete,
}: {
  status: TaskStatus
  tasks: Task[]
  isLoading: boolean
  isError: boolean
  completingTaskId: string | null
  onComplete: (taskId: string, title: string) => void
}) {
  const filtered = useMemo(() => filterTasksByStatus(tasks, status), [tasks, status])

  if (isLoading) {
    return <p className="task-list-panel__status">Carregando atividades…</p>
  }

  if (isError) {
    return (
      <p className="task-list-panel__status task-list-panel__status--error" role="alert">
        Não foi possível carregar suas atividades. Tente atualizar a página.
      </p>
    )
  }

  if (filtered.length === 0) {
    return <p className="task-list-panel__empty">{EMPTY_STATE_MESSAGES[status]}</p>
  }

  return (
    <ul className="task-list-panel__list">
      {filtered.map((task) => (
        <li key={task.id}>
          <ActivityCard
            id={task.id}
            title={task.title}
            startDate={task.startDate}
            endDate={task.endDate}
            status={task.status}
            onComplete={(id) => onComplete(id, task.title)}
            isCompleting={completingTaskId === task.id}
          />
        </li>
      ))}
    </ul>
  )
}

export function TaskListPanel() {
  const [status, setStatus] = useState<TaskStatus>('active')
  const [feedback, setFeedback] = useState('')
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)

  const { data: tasks = [], isLoading, isError } = useTasksQuery()
  const completeMutation = useCompleteTaskMutation()
  const { pending, runIfAllowed, confirm, cancel, isOpen } = useConfirmCriticalAction()

  const handleComplete = (taskId: string, title: string) => {
    runIfAllowed(
      async () => {
        setCompletingTaskId(taskId)
        try {
          await completeMutation.mutateAsync(taskId)
          setFeedback(`Atividade "${title}" concluída com sucesso.`)
        } catch {
          setFeedback('Não foi possível concluir a atividade. Tente novamente.')
        } finally {
          setCompletingTaskId(null)
        }
      },
      {
        title: 'Concluir atividade?',
        description: `Tem certeza de que deseja marcar "${title}" como concluída?`,
        confirmLabel: 'Concluir atividade',
        cancelLabel: 'Cancelar',
      },
    )
  }

  return (
    <section className="task-list-panel" aria-labelledby="activities-heading">
      <h1 id="activities-heading" className="visually-hidden">
        Minhas atividades
      </h1>

      <ActivityTabs
        value={status}
        onValueChange={setStatus}
        options={ACTIVITY_TAB_OPTIONS}
        ariaLabel="Filtrar atividades por status"
      >
        {(activeStatus) => (
          <TaskListContent
            status={activeStatus}
            tasks={tasks}
            isLoading={isLoading}
            isError={isError}
            completingTaskId={completingTaskId}
            onComplete={handleComplete}
          />
        )}
      </ActivityTabs>

      {feedback ? (
        <output className="visually-hidden" aria-live="polite">
          {feedback}
        </output>
      ) : null}

      {pending ? (
        <ConfirmDialog
          open={isOpen}
          title={pending.options.title}
          description={pending.options.description}
          confirmLabel={pending.options.confirmLabel}
          cancelLabel={pending.options.cancelLabel}
          onConfirm={confirm}
          onCancel={cancel}
        />
      ) : null}
    </section>
  )
}
