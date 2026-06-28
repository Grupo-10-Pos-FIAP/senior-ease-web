import { http, HttpResponse } from 'msw'
import {
  completeTaskInDb,
  getTaskFromDb,
  getTasksFromDb,
} from '@infrastructure/msw/db/tasks.db'
import { toTaskDto } from '@infrastructure/mappers/task.mapper'
import { createTask } from '@domain/entities/Task'

export const tasksHandlers = [
  http.get('/api/tasks', () => {
    const tasks = getTasksFromDb().map((dto) => createTask(dto))
    return HttpResponse.json(tasks.map((task) => toTaskDto(task)))
  }),

  http.get('/api/tasks/:id', ({ params }) => {
    const id = params.id as string
    const dto = getTaskFromDb(id)

    if (!dto) {
      return HttpResponse.json({ message: 'Atividade não encontrada' }, { status: 404 })
    }

    return HttpResponse.json(dto)
  }),

  http.patch('/api/tasks/:id/complete', ({ params }) => {
    const id = params.id as string
    const dto = getTaskFromDb(id)

    if (!dto) {
      return HttpResponse.json({ message: 'Atividade não encontrada' }, { status: 404 })
    }

    if (dto.status !== 'active') {
      return HttpResponse.json(
        { message: 'A atividade não pode ser concluída no estado atual' },
        { status: 409 },
      )
    }

    const completed = completeTaskInDb(id)
    return HttpResponse.json(completed)
  }),
]
