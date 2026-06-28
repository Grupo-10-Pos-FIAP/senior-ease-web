import { describe, expect, it } from 'vitest'
import { CompleteTask } from '@application/tasks/CompleteTask'
import { createTask } from '@domain/entities/Task'
import { TaskNotCompletableError } from '@domain/errors/TaskNotCompletableError'
import { FakeTaskRepository } from '@shared/test/fakes/FakeTaskRepository'

describe('CompleteTask', () => {
  const activeTask = createTask({
    id: 'task-1',
    title: 'Curso "Como usar E-mail"',
    startDate: '2026-06-05',
    endDate: '2026-06-22',
    status: 'active',
  })

  it('conclui atividade ativa', async () => {
    const repo = new FakeTaskRepository([activeTask])
    const useCase = new CompleteTask(repo)

    const result = await useCase.execute('task-1')

    expect(result.status).toBe('completed')
  })

  it('rejeita atividade já concluída', async () => {
    const repo = new FakeTaskRepository([
      createTask({ ...activeTask, id: 'task-2', status: 'completed' }),
    ])
    const useCase = new CompleteTask(repo)

    await expect(useCase.execute('task-2')).rejects.toThrow(TaskNotCompletableError)
  })

  it('rejeita atividade expirada', async () => {
    const repo = new FakeTaskRepository([
      createTask({ ...activeTask, id: 'task-3', status: 'expired' }),
    ])
    const useCase = new CompleteTask(repo)

    await expect(useCase.execute('task-3')).rejects.toThrow(TaskNotCompletableError)
  })
})
