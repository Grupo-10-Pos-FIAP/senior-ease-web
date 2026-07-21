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
    title: 'Atividade "Conferindo Avisos no Celular"',
    startDate: "2026-07-15",
    endDate: "2026-08-30",
    status: "active",
    steps: [
      {
        id: "step-14-1",
        label: "Leitura: lendo avisos importantes no celular",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-14-2",
        label: "Quiz: o que fazer com um aviso urgente",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-15",
    title: 'Oficina "Criando sua Conta de E-mail"',
    startDate: "2026-07-15",
    endDate: "2026-08-31",
    status: "active",
    steps: [
      {
        id: "step-15-1",
        label: "Leitura: passos para criar um e-mail",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-15-2",
        label: "Quiz: escolhendo uma senha segura",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-16",
    title: 'Curso "Reconhecendo Links Confiáveis"',
    startDate: "2026-07-15",
    endDate: "2026-08-28",
    status: "active",
    steps: [
      {
        id: "step-16-1",
        label: "Leitura: como identificar um link seguro",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-16-2",
        label: "Quiz: quando desconfiar de um endereço",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-17",
    title: 'Atividade "Usando o Calendário Digital"',
    startDate: "2026-07-15",
    endDate: "2026-08-29",
    status: "active",
    steps: [
      {
        id: "step-17-1",
        label: "Leitura: criando um compromisso no calendário",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-17-2",
        label: "Quiz: lembretes e alertas do calendário",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-18",
    title: 'Oficina "WhatsApp no Celular e no Computador"',
    startDate: "2026-07-15",
    endDate: "2026-08-30",
    status: "active",
    steps: [
      {
        id: "step-18-1",
        label: "Leitura: conversando no WhatsApp do celular",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-18-2",
        label: "Quiz: usando o WhatsApp Web com segurança",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-19",
    title: 'Curso "Pedindo Ajuda por Mensagem"',
    startDate: "2026-07-15",
    endDate: "2026-08-31",
    status: "active",
    steps: [
      {
        id: "step-19-1",
        label: "Leitura: escrevendo um pedido claro",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-19-2",
        label: "Quiz: quando pedir ajuda a alguém de confiança",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-20",
    title: 'Atividade "Salvando Contatos de Emergência"',
    startDate: "2026-07-15",
    endDate: "2026-08-27",
    status: "active",
    steps: [
      {
        id: "step-20-1",
        label: "Leitura: cadastrando um contato importante",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-20-2",
        label: "Quiz: quem incluir na lista de emergência",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-21",
    title: 'Oficina "Reconhecendo Links Seguros"',
    startDate: "2026-07-15",
    endDate: "2026-08-28",
    status: "active",
    steps: [
      {
        id: "step-21-1",
        label: "Leitura: https e o cadeado do navegador",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-21-2",
        label: "Quiz: quando desconfiar de um link",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-1",
    title: 'Oficina "Primeiros Passos no Digital"',
    startDate: "2026-07-15",
    endDate: "2026-08-05",
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
    startDate: "2026-07-15",
    endDate: "2026-08-08",
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
    startDate: "2026-07-15",
    endDate: "2026-08-12",
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
    startDate: "2026-07-15",
    endDate: "2026-08-15",
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
    startDate: "2026-07-15",
    endDate: "2026-08-18",
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
    startDate: "2026-07-15",
    endDate: "2026-08-20",
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
    startDate: "2026-07-15",
    endDate: "2026-08-22",
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
    startDate: "2026-07-15",
    endDate: "2026-08-25",
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
    startDate: "2026-07-15",
    endDate: "2026-09-30",
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
    startDate: "2026-07-15",
    endDate: "2026-08-28",
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
    startDate: "2026-07-15",
    endDate: "2026-09-05",
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
    startDate: "2026-07-15",
    endDate: "2026-09-10",
    status: "active",
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
    startDate: "2026-07-15",
    endDate: "2026-09-15",
    status: "active",
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
  {
    id: "task-22",
    title: 'Oficina "Criando Conta de E-mail"',
    startDate: "2026-06-01",
    endDate: "2026-08-10",
    status: "expired",
    steps: [
      {
        id: "step-22-1",
        label: "Leitura: escolhendo um provedor de e-mail",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-22-2",
        label: "Quiz: senha forte para o e-mail",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-23",
    title: 'Curso "Instalando Aplicativos com Segurança"',
    startDate: "2026-06-01",
    endDate: "2026-08-12",
    status: "expired",
    steps: [
      {
        id: "step-23-1",
        label: "Leitura: baixando só de lojas oficiais",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-23-2",
        label: "Quiz: permissões que um app pede",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-24",
    title: 'Atividade "Pagando Contas pelo Celular"',
    startDate: "2026-06-05",
    endDate: "2026-08-14",
    status: "expired",
    steps: [
      {
        id: "step-24-1",
        label: "Leitura: boleto e Pix com atenção",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-24-2",
        label: "Quiz: evitando golpes no pagamento",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-25",
    title: 'Oficina "Usando o GPS sem Confusão"',
    startDate: "2026-06-05",
    endDate: "2026-08-16",
    status: "expired",
    steps: [
      {
        id: "step-25-1",
        label: "Leitura: traçando um caminho simples",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-25-2",
        label: "Quiz: quando confiar no mapa",
        type: "multiple_choice",
        order: 2,
      },
    ],
  },
  {
    id: "task-26",
    title: 'Curso "Protegendo Fotos e Documentos"',
    startDate: "2026-06-10",
    endDate: "2026-08-18",
    status: "expired",
    steps: [
      {
        id: "step-26-1",
        label: "Leitura: fazendo cópia de segurança",
        type: "content_reading",
        order: 1,
      },
      {
        id: "step-26-2",
        label: "Quiz: onde guardar arquivos importantes",
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

export function buildDefaultProgressForCatalog(
  activityIds: string[],
  existing: ActivityProgressDto[] = [],
): ActivityProgressDto[] {
  const existingById = new Map(existing.map((progress) => [progress.activityId, progress]));

  return activityIds.map((activityId) => {
    const current = existingById.get(activityId);
    if (current) {
      const progress: ActivityProgressDto = {
        ...current,
        completedStepIds: [...current.completedStepIds],
        completedGuideStepIds: [...(current.completedGuideStepIds ?? [])],
      };

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
