import { DEFAULT_COURSE_ID, DEFAULT_COURSE_TITLE } from "../../domain/constants/course";
import type { ActivityDto, ActivityProgressDto } from "@infrastructure/mappers/activity.mapper";
import { enrichActivityStepsWithContent } from "@infrastructure/seed/activityStepContent.seed";

/**
 * Data de referência do demo. Os prazos das atividades ativas foram definidos
 * para cobrir todos os cenários de badge (hoje até 7 dias) a partir desta data.
 */
export const TASK_MOCK_REFERENCE_DATE = "2026-06-29";

export const DEFAULT_COURSE_SEED = {
  id: DEFAULT_COURSE_ID,
  title: DEFAULT_COURSE_TITLE,
};

export const ACTIVITY_CATALOG_SEED: ActivityDto[] = [
  {
    id: "task-1",
    title: 'Oficina "Primeiros Passos no Digital"',
    startDate: "2026-06-10",
    endDate: "2026-06-29",
    status: "active",
    steps: [
      { id: "step-1-1", label: "Conhecendo o mundo digital", type: "content_reading", order: 1 },
      {
        id: "step-1-2",
        label: "Quiz: hábitos seguros na internet",
        type: "multiple_choice",
        order: 2,
      },
      {
        id: "step-1-3",
        label: "Reflexão: o que você quer aprender?",
        type: "open_question",
        order: 3,
      },
      { id: "step-1-4", label: "Vídeo: navegando com segurança", type: "watch_content", order: 4 },
    ],
  },
  {
    id: "task-2",
    title: 'Curso "Como usar E-mail"',
    startDate: "2026-06-10",
    endDate: "2026-06-30",
    status: "active",
    steps: [
      { id: "step-2-1", label: "Acessar sua caixa de entrada", type: "content_reading", order: 1 },
      { id: "step-2-2", label: "Escrever uma mensagem", type: "content_reading", order: 2 },
      { id: "step-2-3", label: "Quiz: partes de uma mensagem", type: "multiple_choice", order: 3 },
    ],
  },
  {
    id: "task-3",
    title: 'Atividade "Videochamadas sem Medo"',
    startDate: "2026-06-15",
    endDate: "2026-07-01",
    status: "active",
    steps: [
      {
        id: "step-3-1",
        label: "Vídeo: como funciona uma videochamada",
        type: "watch_content",
        order: 1,
      },
      {
        id: "step-3-2",
        label: "Dicas para falar com confiança",
        type: "content_reading",
        order: 2,
      },
      {
        id: "step-3-3",
        label: "Quiz: preparando câmera e microfone",
        type: "multiple_choice",
        order: 3,
      },
    ],
  },
  {
    id: "task-4",
    title: "Oficina de Segurança Digital",
    startDate: "2026-06-15",
    endDate: "2026-07-02",
    status: "active",
    steps: [
      {
        id: "step-4-1",
        label: "Leitura: reconhecendo golpes na internet",
        type: "content_reading",
        order: 1,
      },
      { id: "step-4-2", label: "Quiz: mensagens suspeitas", type: "multiple_choice", order: 2 },
      {
        id: "step-4-3",
        label: "Como você protege suas informações?",
        type: "open_question",
        order: 3,
      },
      { id: "step-4-4", label: "Vídeo: criando senhas seguras", type: "watch_content", order: 4 },
    ],
  },
  {
    id: "task-9",
    title: 'Atividade "Organizando Arquivos no Computador"',
    startDate: "2026-06-15",
    endDate: "2026-07-03",
    status: "active",
    steps: [
      {
        id: "step-9-1",
        label: "Leitura: pastas e arquivos no computador",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-9-2",
        label: "Quiz: organizando documentos importantes",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-10",
    title: 'Curso "Pesquisando na Internet com Segurança"',
    startDate: "2026-06-15",
    endDate: "2026-07-04",
    status: "active",
    steps: [
      {
        id: "step-10-1",
        label: "Leitura: buscando informações confiáveis",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-10-2",
        label: "Quiz: sites seguros e suspeitos",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-11",
    title: 'Oficina "Usando o Teclado com Confiança"',
    startDate: "2026-06-15",
    endDate: "2026-07-05",
    status: "active",
    steps: [
      {
        id: "step-11-1",
        label: "Vídeo: teclas principais do teclado",
        type: "watch_content",
        order: 1,
      },
      {
        id: "step-11-2",
        label: "Quiz: atalhos úteis no dia a dia",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-12",
    title: 'Atividade "Introdução ao WhatsApp"',
    startDate: "2026-06-15",
    endDate: "2026-07-06",
    status: "active",
    steps: [
      {
        id: "step-12-1",
        label: "Leitura: enviando sua primeira mensagem",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-12-2",
        label: "Quiz: privacidade no WhatsApp",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-13",
    title: 'Oficina "Planejando o Orçamento Mensal"',
    startDate: "2026-06-15",
    endDate: "2026-07-15",
    status: "active",
    steps: [
      {
        id: "step-13-1",
        label: "Leitura: anotando gastos e receitas",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-13-2",
        label: "Reflexão: como você organiza suas contas?",
        type: "open_question",
        order: 2,
      },
    ],
  },
  {
    id: "task-5",
    title: 'Atividade "Currículo Digital"',
    startDate: "2026-05-25",
    endDate: "2026-05-30",
    status: "active",
    steps: [
      {
        id: "step-5-1",
        label: "Leitura: estrutura de um currículo online",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-5-2",
        label: "Quiz: o que incluir no currículo",
        type: "multiple_choice",
        order: 2,
      },
      {
        id: "step-5-3",
        label: "Descreva uma experiência profissional",
        type: "open_question",
        order: 3,
      },
    ],
  },
  {
    id: "task-6",
    title: 'Oficina "Entrevista de Emprego Online"',
    startDate: "2026-05-10",
    endDate: "2026-05-18",
    status: "active",
    steps: [
      {
        id: "step-6-1",
        label: "Vídeo: como se preparar para entrevistas online",
        type: "watch_content",
        order: 1,
      },
      {
        id: "step-6-2",
        label: "Leitura: postura e comunicação em entrevistas",
        type: "content_reading",
        order: 2,
      },
      {
        id: "step-6-3",
        label: "Quiz: ambiente ideal para a entrevista",
        type: "multiple_choice",
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
        order: 1,
      },
      {
        id: "step-7-2",
        label: "Quiz: escolhendo a melhor atitude",
        type: "multiple_choice",
        order: 2,
      },
      {
        id: "step-7-3",
        label: "Como você reagiria a essa situação?",
        type: "open_question",
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
        order: 1,
      },
      {
        id: "step-8-2",
        label: "Vídeo: identificando lojas confiáveis",
        type: "watch_content",
        order: 2,
      },
      {
        id: "step-8-3",
        label: "Quiz: formas de pagamento seguras",
        type: "multiple_choice",
        order: 3,
      },
    ],
  },
];

/** Progresso demo para MSW / desenvolvimento local. */
export const DEMO_ACTIVITY_PROGRESS_SEED: Record<string, ActivityProgressDto[]> = {
  "demo-user": [
    { activityId: "task-2", status: "active", completedStepIds: ["step-2-1"] },
    {
      activityId: "task-5",
      status: "completed",
      completedStepIds: ["step-5-1", "step-5-2", "step-5-3"],
    },
    {
      activityId: "task-6",
      status: "completed",
      completedStepIds: ["step-6-1", "step-6-2", "step-6-3"],
    },
  ],
};

export function resolveCatalogStatusByEndDate(
  endDate: string,
  referenceDate: Date = new Date(),
): "active" | "expired" {
  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  const end = new Date(`${endDate}T00:00:00`);

  return end < today ? "expired" : "active";
}

export function applyCatalogExpiration(
  activities: ActivityDto[],
  referenceDate: Date = new Date(),
): ActivityDto[] {
  return activities.map((activity) => ({
    ...activity,
    status: resolveCatalogStatusByEndDate(activity.endDate, referenceDate),
  }));
}

export function cloneActivityCatalogSeed(referenceDate?: Date): ActivityDto[] {
  const activities = ACTIVITY_CATALOG_SEED.map((activity) =>
    enrichActivityStepsWithContent({
      ...activity,
      steps: activity.steps.map((step) => ({ ...step })),
    }),
  );

  return referenceDate ? applyCatalogExpiration(activities, referenceDate) : activities;
}

export function getDemoProgressForUser(userId: string): ActivityProgressDto[] {
  return (DEMO_ACTIVITY_PROGRESS_SEED[userId] ?? []).map((progress) => ({
    ...progress,
    completedStepIds: [...progress.completedStepIds],
  }));
}

export function buildDefaultProgressForCatalog(
  activityIds: string[],
  existing: ActivityProgressDto[] = [],
): ActivityProgressDto[] {
  const existingById = new Map(existing.map((progress) => [progress.activityId, progress]));

  return activityIds.map((activityId) => {
    const current = existingById.get(activityId);
    if (current) {
      return {
        ...current,
        completedStepIds: [...current.completedStepIds],
        stepAnswers: current.stepAnswers ? { ...current.stepAnswers } : undefined,
      };
    }

    return {
      activityId,
      status: "active",
      completedStepIds: [],
    };
  });
}
