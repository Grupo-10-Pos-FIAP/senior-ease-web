import type { TaskDto } from '@infrastructure/mappers/task.mapper'

const seedTasks: TaskDto[] = [
  {
    id: 'task-1',
    title: 'Oficina "Primeiros Passos no Digital"',
    startDate: '2026-06-05',
    endDate: '2026-06-14',
    status: 'active',
    steps: [
      { id: 'step-1-1', label: 'Ligar o computador com calma', completed: false, order: 1 },
      { id: 'step-1-2', label: 'Abrir o navegador de internet', completed: false, order: 2 },
    ],
  },
  {
    id: 'task-2',
    title: 'Curso "Como usar E-mail"',
    startDate: '2026-06-05',
    endDate: '2026-06-22',
    status: 'active',
    steps: [
      { id: 'step-2-1', label: 'Acessar sua caixa de entrada', completed: false, order: 1 },
      { id: 'step-2-2', label: 'Escrever uma mensagem', completed: false, order: 2 },
    ],
  },
  {
    id: 'task-3',
    title: 'Atividade "Videochamadas sem Medo"',
    startDate: '2026-06-20',
    endDate: '2026-07-12',
    status: 'active',
    steps: [
      { id: 'step-3-1', label: 'Testar câmera e microfone', completed: false, order: 1 },
      { id: 'step-3-2', label: 'Entrar em uma chamada de teste', completed: false, order: 2 },
    ],
  },
  {
    id: 'task-4',
    title: 'Oficina de Segurança Digital',
    startDate: '2026-06-05',
    endDate: '2026-06-22',
    status: 'active',
    steps: [
      { id: 'step-4-1', label: 'Reconhecer mensagens suspeitas', completed: false, order: 1 },
      { id: 'step-4-2', label: 'Criar senhas seguras', completed: false, order: 2 },
    ],
  },
  {
    id: 'task-5',
    title: 'Atividade "Currículo Digital"',
    startDate: '2026-05-25',
    endDate: '2026-05-30',
    status: 'completed',
    steps: [
      { id: 'step-5-1', label: 'Abrir o modelo de currículo', completed: true, order: 1 },
      { id: 'step-5-2', label: 'Preencher experiências', completed: true, order: 2 },
    ],
  },
  {
    id: 'task-6',
    title: 'Oficina "Entrevista de Emprego Online"',
    startDate: '2026-05-10',
    endDate: '2026-05-18',
    status: 'completed',
    steps: [
      { id: 'step-6-1', label: 'Preparar o ambiente', completed: true, order: 1 },
      { id: 'step-6-2', label: 'Participar da simulação', completed: true, order: 2 },
    ],
  },
  {
    id: 'task-7',
    title: 'Simulação de Situações Reais',
    startDate: '2026-04-01',
    endDate: '2026-04-15',
    status: 'expired',
    steps: [
      { id: 'step-7-1', label: 'Escolher um cenário', completed: false, order: 1 },
      { id: 'step-7-2', label: 'Responder às situações', completed: false, order: 2 },
    ],
  },
  {
    id: 'task-8',
    title: 'Atividade "Compras Online com Segurança"',
    startDate: '2026-03-01',
    endDate: '2026-03-15',
    status: 'expired',
    steps: [
      { id: 'step-8-1', label: 'Identificar sites confiáveis', completed: false, order: 1 },
      { id: 'step-8-2', label: 'Conferir formas de pagamento', completed: false, order: 2 },
    ],
  },
]

function cloneTasks(): TaskDto[] {
  return seedTasks.map((task) => ({
    ...task,
    steps: task.steps.map((step) => ({ ...step })),
  }))
}

let tasksDb = cloneTasks()

export function getTasksFromDb(): TaskDto[] {
  return tasksDb.map((task) => ({
    ...task,
    steps: task.steps.map((step) => ({ ...step })),
  }))
}

export function getTaskFromDb(id: string): TaskDto | undefined {
  const task = tasksDb.find((item) => item.id === id)
  if (!task) return undefined
  return {
    ...task,
    steps: task.steps.map((step) => ({ ...step })),
  }
}

export function completeTaskInDb(id: string): TaskDto | undefined {
  const index = tasksDb.findIndex((item) => item.id === id)
  if (index === -1) return undefined

  tasksDb[index] = {
    ...tasksDb[index],
    status: 'completed',
    steps: tasksDb[index].steps.map((step) => ({ ...step, completed: true })),
  }

  return getTaskFromDb(id)
}

export function resetTasksDb(): void {
  tasksDb = cloneTasks()
}
