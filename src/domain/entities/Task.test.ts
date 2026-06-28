import { describe, expect, it } from 'vitest'
import { createTask, isTaskActive } from '@domain/entities/Task'

describe('Task', () => {
  const baseInput = {
    id: 'task-1',
    title: 'Oficina "Primeiros Passos no Digital"',
    startDate: '2026-06-05',
    endDate: '2026-06-14',
    status: 'active' as const,
    steps: [{ id: 'step-1', label: 'Abrir o navegador', completed: false, order: 1 }],
  }

  it('cria atividade válida', () => {
    const task = createTask(baseInput)

    expect(task.title).toBe('Oficina "Primeiros Passos no Digital"')
    expect(task.status).toBe('active')
    expect(task.steps).toHaveLength(1)
  })

  it('rejeita título vazio', () => {
    expect(() => createTask({ ...baseInput, title: '   ' })).toThrow(/título/i)
  })

  it('rejeita data inválida', () => {
    expect(() => createTask({ ...baseInput, startDate: '05/06/2026' })).toThrow(/datas/i)
  })

  it('rejeita intervalo invertido', () => {
    expect(() =>
      createTask({ ...baseInput, startDate: '2026-06-20', endDate: '2026-06-01' }),
    ).toThrow(/data inicial/i)
  })

  it('identifica atividade ativa', () => {
    expect(isTaskActive(createTask(baseInput))).toBe(true)
    expect(isTaskActive(createTask({ ...baseInput, status: 'completed' }))).toBe(false)
  })
})
