import type { TaskDto } from "@infrastructure/mappers/task.mapper";

export const TASK_SEED_DATA: TaskDto[] = [
  {
    id: "task-1",
    title: 'Oficina "Primeiros Passos no Digital"',
    startDate: "2026-06-05",
    endDate: "2026-06-14",
    status: "active",
    steps: [
      {
        id: "step-1-1",
        label: "Conhecendo o mundo digital",
        type: "content_reading",
        completed: false,
        order: 1,
      },
      {
        id: "step-1-2",
        label: "Quiz: hábitos seguros na internet",
        type: "multiple_choice",
        completed: false,
        order: 2,
      },
      {
        id: "step-1-3",
        label: "Reflexão: o que você quer aprender?",
        type: "open_question",
        completed: false,
        order: 3,
      },
      {
        id: "step-1-4",
        label: "Vídeo: navegando com segurança",
        type: "watch_content",
        completed: false,
        order: 4,
      },
    ],
  },
  {
    id: "task-2",
    title: 'Curso "Como usar E-mail"',
    startDate: "2026-06-05",
    endDate: "2026-06-22",
    status: "active",
    steps: [
      {
        id: "step-2-1",
        label: "Acessar sua caixa de entrada",
        type: "content_reading",
        completed: true,
        order: 1,
      },
      {
        id: "step-2-2",
        label: "Escrever uma mensagem",
        type: "content_reading",
        completed: false,
        order: 2,
      },
      {
        id: "step-2-3",
        label: "Quiz: partes de uma mensagem",
        type: "multiple_choice",
        completed: false,
        order: 3,
      },
    ],
  },
  {
    id: "task-3",
    title: 'Atividade "Videochamadas sem Medo"',
    startDate: "2026-06-20",
    endDate: "2026-07-12",
    status: "active",
    steps: [
      {
        id: "step-3-1",
        label: "Vídeo: como funciona uma videochamada",
        type: "watch_content",
        completed: false,
        order: 1,
      },
      {
        id: "step-3-2",
        label: "Dicas para falar com confiança",
        type: "content_reading",
        completed: false,
        order: 2,
      },
      {
        id: "step-3-3",
        label: "Quiz: preparando câmera e microfone",
        type: "multiple_choice",
        completed: false,
        order: 3,
      },
    ],
  },
  {
    id: "task-4",
    title: "Oficina de Segurança Digital",
    startDate: "2026-06-05",
    endDate: "2026-06-22",
    status: "active",
    steps: [
      {
        id: "step-4-1",
        label: "Leitura: reconhecendo golpes na internet",
        type: "content_reading",
        completed: false,
        order: 1,
      },
      {
        id: "step-4-2",
        label: "Quiz: mensagens suspeitas",
        type: "multiple_choice",
        completed: false,
        order: 2,
      },
      {
        id: "step-4-3",
        label: "Como você protege suas informações?",
        type: "open_question",
        completed: false,
        order: 3,
      },
      {
        id: "step-4-4",
        label: "Vídeo: criando senhas seguras",
        type: "watch_content",
        completed: false,
        order: 4,
      },
    ],
  },
  {
    id: "task-5",
    title: 'Atividade "Currículo Digital"',
    startDate: "2026-05-25",
    endDate: "2026-05-30",
    status: "completed",
    steps: [
      {
        id: "step-5-1",
        label: "Leitura: estrutura de um currículo online",
        type: "content_reading",
        completed: true,
        order: 1,
      },
      {
        id: "step-5-2",
        label: "Quiz: o que incluir no currículo",
        type: "multiple_choice",
        completed: true,
        order: 2,
      },
      {
        id: "step-5-3",
        label: "Descreva uma experiência profissional",
        type: "open_question",
        completed: true,
        order: 3,
      },
    ],
  },
  {
    id: "task-6",
    title: 'Oficina "Entrevista de Emprego Online"',
    startDate: "2026-05-10",
    endDate: "2026-05-18",
    status: "completed",
    steps: [
      {
        id: "step-6-1",
        label: "Vídeo: como se preparar para entrevistas online",
        type: "watch_content",
        completed: true,
        order: 1,
      },
      {
        id: "step-6-2",
        label: "Leitura: postura e comunicação em entrevistas",
        type: "content_reading",
        completed: true,
        order: 2,
      },
      {
        id: "step-6-3",
        label: "Quiz: ambiente ideal para a entrevista",
        type: "multiple_choice",
        completed: true,
        order: 3,
      },
    ],
  },
  {
    id: "task-7",
    title: "Simulação de Situações Reais",
    startDate: "2026-04-01",
    endDate: "2026-04-15",
    status: "expired",
    steps: [
      {
        id: "step-7-1",
        label: "Leitura: situações do dia a dia no digital",
        type: "content_reading",
        completed: false,
        order: 1,
      },
      {
        id: "step-7-2",
        label: "Quiz: escolhendo a melhor atitude",
        type: "multiple_choice",
        completed: false,
        order: 2,
      },
      {
        id: "step-7-3",
        label: "Como você reagiria a essa situação?",
        type: "open_question",
        completed: false,
        order: 3,
      },
    ],
  },
  {
    id: "task-8",
    title: 'Atividade "Compras Online com Segurança"',
    startDate: "2026-03-01",
    endDate: "2026-03-15",
    status: "expired",
    steps: [
      {
        id: "step-8-1",
        label: "Leitura: comprando com segurança",
        type: "content_reading",
        completed: false,
        order: 1,
      },
      {
        id: "step-8-2",
        label: "Vídeo: identificando lojas confiáveis",
        type: "watch_content",
        completed: false,
        order: 2,
      },
      {
        id: "step-8-3",
        label: "Quiz: formas de pagamento seguras",
        type: "multiple_choice",
        completed: false,
        order: 3,
      },
    ],
  },
];

function cloneTasks(): TaskDto[] {
  return TASK_SEED_DATA.map((task) => ({
    ...task,
    steps: task.steps.map((step) => ({ ...step })),
  }));
}

let tasksDb = cloneTasks();

export function getTasksFromDb(): TaskDto[] {
  return tasksDb.map((task) => ({
    ...task,
    steps: task.steps.map((step) => ({ ...step })),
  }));
}

export function getTaskFromDb(id: string): TaskDto | undefined {
  const task = tasksDb.find((item) => item.id === id);
  if (!task) return undefined;
  return {
    ...task,
    steps: task.steps.map((step) => ({ ...step })),
  };
}

export function completeTaskInDb(id: string): TaskDto | undefined {
  const index = tasksDb.findIndex((item) => item.id === id);
  if (index === -1) return undefined;

  tasksDb[index] = {
    ...tasksDb[index],
    status: "completed",
    steps: tasksDb[index].steps.map((step) => ({ ...step, completed: true })),
  };

  return getTaskFromDb(id);
}

export function resetTasksDb(): void {
  tasksDb = cloneTasks();
}
