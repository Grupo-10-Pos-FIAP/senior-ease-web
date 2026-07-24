import { DEFAULT_COURSE_ID, DEFAULT_COURSE_TITLE } from "../../domain/constants/course";
import type { ActivityDto, ActivityProgressDto } from "@infrastructure/mappers/activity.mapper";
import { enrichActivityStepsWithContent } from "@infrastructure/seed/activityStepContent.seed";

/**
 * Data de referência do demo (hoje do catálogo).
 * - task-14..task-21: badges de prazo (hoje até 7 dias)
 * - task-22..task-26: já expiradas (prazo antes da data de referência)
 * - demais: prazos futuros até setembro/2026
 */
export const TASK_MOCK_REFERENCE_DATE = "2026-07-21";

export const DEFAULT_COURSE_SEED = {
  id: DEFAULT_COURSE_ID,
  title: DEFAULT_COURSE_TITLE,
};

export const ACTIVITY_CATALOG_SEED: ActivityDto[] = [
  {
    id: "task-14",
    title: "Conferindo avisos no celular",
    startDate: "2026-07-15",
    endDate: "2026-08-30",
    status: "active",
    steps: [
      {
        id: "step-14-1",
        label: "Lendo avisos importantes no celular",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-14-2",
        label: "O que fazer com um aviso urgente",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-15",
    title: "Criando sua conta de e-mail",
    startDate: "2026-07-15",
    endDate: "2026-08-31",
    status: "active",
    steps: [
      {
        id: "step-15-1",
        label: "Passos para criar um e-mail",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-15-2",
        label: "Escolhendo uma senha segura",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-16",
    title: "Reconhecendo links confiáveis",
    startDate: "2026-07-15",
    endDate: "2026-08-28",
    status: "active",
    steps: [
      {
        id: "step-16-1",
        label: "Como identificar um link seguro",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-16-2",
        label: "Quando desconfiar de um endereço",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-17",
    title: "Usando o calendário digital",
    startDate: "2026-07-15",
    endDate: "2026-08-29",
    status: "active",
    steps: [
      {
        id: "step-17-1",
        label: "Criando um compromisso no calendário",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-17-2",
        label: "Lembretes e alertas do calendário",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-18",
    title: "WhatsApp no celular e no computador",
    startDate: "2026-07-15",
    endDate: "2026-08-30",
    status: "active",
    steps: [
      {
        id: "step-18-1",
        label: "Conversando no WhatsApp do celular",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-18-2",
        label: "Usando o WhatsApp Web com segurança",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-19",
    title: "Pedindo ajuda por mensagem",
    startDate: "2026-07-15",
    endDate: "2026-08-31",
    status: "active",
    steps: [
      {
        id: "step-19-1",
        label: "Escrevendo um pedido claro",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-19-2",
        label: "Quando pedir ajuda a alguém de confiança",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-20",
    title: "Salvando contatos de emergência",
    startDate: "2026-07-15",
    endDate: "2026-08-27",
    status: "active",
    steps: [
      {
        id: "step-20-1",
        label: "Cadastrando um contato importante",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-20-2",
        label: "Quem incluir na lista de emergência",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-21",
    title: "Reconhecendo links seguros",
    startDate: "2026-07-15",
    endDate: "2026-08-28",
    status: "active",
    steps: [
      {
        id: "step-21-1",
        label: "HTTPS e o cadeado do navegador",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-21-2",
        label: "Quando desconfiar de um link",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-1",
    title: "Primeiros passos no digital",
    startDate: "2026-07-15",
    endDate: "2026-08-05",
    status: "active",
    steps: [
      { id: "step-1-1", label: "Conhecendo o mundo digital", type: "content_reading", order: 1 },
      {
        id: "step-1-2",
        label: "Hábitos seguros na internet",
        type: "multiple_choice",
        order: 2,
      },
      {
        id: "step-1-3",
        label: "O que você quer aprender?",
        type: "open_question",
        order: 3,
      },
      { id: "step-1-4", label: "Navegando com segurança", type: "watch_content", order: 4 },
    ],
  },
  {
    id: "task-2",
    title: "Como usar o e-mail",
    startDate: "2026-07-15",
    endDate: "2026-08-08",
    status: "active",
    steps: [
      { id: "step-2-1", label: "Acessar sua caixa de entrada", type: "content_reading", order: 1 },
      { id: "step-2-2", label: "Escrever uma mensagem", type: "content_reading", order: 2 },
      { id: "step-2-3", label: "Partes de uma mensagem", type: "multiple_choice", order: 3 },
    ],
  },
  {
    id: "task-3",
    title: "Videochamadas sem medo",
    startDate: "2026-07-15",
    endDate: "2026-08-12",
    status: "active",
    steps: [
      {
        id: "step-3-1",
        label: "Como funciona uma videochamada",
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
        label: "Preparando câmera e microfone",
        type: "multiple_choice",
        order: 3,
      },
    ],
  },
  {
    id: "task-4",
    title: "Segurança digital",
    startDate: "2026-07-15",
    endDate: "2026-08-15",
    status: "active",
    steps: [
      {
        id: "step-4-1",
        label: "Reconhecendo golpes na internet",
        type: "content_reading",
        order: 1,
      },
      { id: "step-4-2", label: "Mensagens suspeitas", type: "multiple_choice", order: 2 },
      {
        id: "step-4-3",
        label: "Como você protege suas informações?",
        type: "open_question",
        order: 3,
      },
      { id: "step-4-4", label: "Criando senhas seguras", type: "watch_content", order: 4 },
    ],
  },
  {
    id: "task-9",
    title: "Organizando arquivos no computador",
    startDate: "2026-07-15",
    endDate: "2026-08-18",
    status: "active",
    steps: [
      {
        id: "step-9-1",
        label: "Pastas e arquivos no computador",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-9-2",
        label: "Organizando documentos importantes",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-10",
    title: "Pesquisando na internet com segurança",
    startDate: "2026-07-15",
    endDate: "2026-08-20",
    status: "active",
    steps: [
      {
        id: "step-10-1",
        label: "Buscando informações confiáveis",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-10-2",
        label: "Sites seguros e suspeitos",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-11",
    title: "Usando o teclado com confiança",
    startDate: "2026-07-15",
    endDate: "2026-08-22",
    status: "active",
    steps: [
      {
        id: "step-11-1",
        label: "Teclas principais do teclado",
        type: "watch_content",
        order: 1,
      },
      {
        id: "step-11-2",
        label: "Atalhos úteis no dia a dia",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-12",
    title: "Introdução ao WhatsApp",
    startDate: "2026-07-15",
    endDate: "2026-08-25",
    status: "active",
    steps: [
      {
        id: "step-12-1",
        label: "Enviando sua primeira mensagem",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-12-2",
        label: "Privacidade no WhatsApp",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-13",
    title: "Planejando o orçamento mensal",
    startDate: "2026-07-15",
    endDate: "2026-09-30",
    status: "active",
    steps: [
      {
        id: "step-13-1",
        label: "Anotando gastos e receitas",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-13-2",
        label: "Como você organiza suas contas?",
        type: "open_question",
        order: 2,
      },
    ],
  },
  {
    id: "task-5",
    title: "Currículo digital",
    startDate: "2026-07-15",
    endDate: "2026-08-28",
    status: "active",
    steps: [
      {
        id: "step-5-1",
        label: "Estrutura de um currículo online",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-5-2",
        label: "O que incluir no currículo",
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
    title: "Entrevista de emprego online",
    startDate: "2026-07-15",
    endDate: "2026-09-05",
    status: "active",
    steps: [
      {
        id: "step-6-1",
        label: "Como se preparar para entrevistas online",
        type: "watch_content",
        order: 1,
      },
      {
        id: "step-6-2",
        label: "Postura e comunicação em entrevistas",
        type: "content_reading",
        order: 2,
      },
      {
        id: "step-6-3",
        label: "Ambiente ideal para a entrevista",
        type: "multiple_choice",
        order: 3,
      },
    ],
  },
  {
    id: "task-7",
    title: "Simulação de situações reais",
    startDate: "2026-07-15",
    endDate: "2026-09-10",
    status: "active",
    steps: [
      {
        id: "step-7-1",
        label: "Situações do dia a dia no digital",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-7-2",
        label: "Escolhendo a melhor atitude",
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
    title: "Compras online com segurança",
    startDate: "2026-07-15",
    endDate: "2026-09-15",
    status: "active",
    steps: [
      {
        id: "step-8-1",
        label: "Comprando com segurança",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-8-2",
        label: "Identificando lojas confiáveis",
        type: "watch_content",
        order: 2,
      },
      {
        id: "step-8-3",
        label: "Formas de pagamento seguras",
        type: "multiple_choice",
        order: 3,
      },
    ],
  },
  {
    id: "task-22",
    title: "Criando conta de e-mail",
    startDate: "2026-06-01",
    endDate: "2026-08-10",
    status: "expired",
    steps: [
      {
        id: "step-22-1",
        label: "Escolhendo um provedor de e-mail",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-22-2",
        label: "Senha forte para o e-mail",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-23",
    title: "Instalando aplicativos com segurança",
    startDate: "2026-06-01",
    endDate: "2026-08-12",
    status: "expired",
    steps: [
      {
        id: "step-23-1",
        label: "Baixando só de lojas oficiais",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-23-2",
        label: "Permissões que um app pede",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-24",
    title: "Pagando contas pelo celular",
    startDate: "2026-06-05",
    endDate: "2026-08-14",
    status: "expired",
    steps: [
      {
        id: "step-24-1",
        label: "Boleto e Pix com atenção",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-24-2",
        label: "Evitando golpes no pagamento",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-25",
    title: "Usando o GPS sem confusão",
    startDate: "2026-06-05",
    endDate: "2026-08-16",
    status: "expired",
    steps: [
      {
        id: "step-25-1",
        label: "Traçando um caminho simples",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-25-2",
        label: "Quando confiar no mapa",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-26",
    title: "Protegendo fotos e documentos",
    startDate: "2026-06-10",
    endDate: "2026-08-18",
    status: "expired",
    steps: [
      {
        id: "step-26-1",
        label: "Fazendo cópia de segurança",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-26-2",
        label: "Onde guardar arquivos importantes",
        type: "multiple_choice",
        order: 2,
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
    completedGuideStepIds: [...(progress.completedGuideStepIds ?? [])],
  }));
}

function asStringIdList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function buildDefaultProgressForCatalog(
  activityIds: string[],
  existing: Array<Partial<ActivityProgressDto> & Pick<ActivityProgressDto, "activityId">> = [],
): ActivityProgressDto[] {
  const existingById = new Map(existing.map((progress) => [progress.activityId, progress]));

  return activityIds.map((activityId) => {
    const current = existingById.get(activityId);
    if (current) {
      const progress: ActivityProgressDto = {
        activityId: current.activityId,
        status: current.status === "completed" ? "completed" : "active",
        completedStepIds: asStringIdList(current.completedStepIds),
        completedGuideStepIds: asStringIdList(current.completedGuideStepIds),
      };

      if (current.startedAt) {
        progress.startedAt = current.startedAt;
      }

      if (current.currentStepId) {
        progress.currentStepId = current.currentStepId;
      }

      if (current.stepAnswers) {
        progress.stepAnswers = { ...current.stepAnswers };
      }

      return progress;
    }

    return {
      activityId,
      status: "active",
      completedStepIds: [],
      completedGuideStepIds: [],
    };
  });
}
