import type { ActivityStepContent } from "@domain/value-objects/ActivityStepContent";
import type { TaskStepType } from "@domain/value-objects/TaskStepType";
import type { ActivityStepDto } from "@infrastructure/mappers/activity.mapper";

const READING_BODY_BY_STEP: Record<string, string> = {
  "step-1-1": `O mundo digital reúne ferramentas para aprender, conversar com familiares, resolver tarefas do dia a dia e buscar oportunidades de trabalho. Não é preciso saber tudo de uma vez — cada pessoa aprende no seu ritmo.

Na internet, você encontra textos para estudar, vídeos explicativos, perguntas para refletir e quizzes para fixar o que aprendeu. O importante é ler com atenção, assistir com calma e pedir ajuda quando algo não estiver claro.

Errar faz parte do aprendizado. Com prática e paciência, o digital pode se tornar um aliado na sua rotina acadêmica e profissional.`,
  "step-2-1": `Para acessar sua caixa de entrada, abra o programa ou site de e-mail e faça login com seu usuário e senha. Na tela principal, procure a pasta "Caixa de entrada" ou "Inbox".

As mensagens novas aparecem em ordem, geralmente com a mais recente no topo. Toque ou clique em uma mensagem para ler o conteúdo completo.`,
  "step-2-2": `Para escrever uma mensagem, procure o botão "Novo", "Escrever" ou um ícone de lápis. Preencha o campo "Para" com o e-mail de quem vai receber.

No campo "Assunto", escreva um resumo curto do que a mensagem trata. No corpo, escreva sua mensagem com calma e revise antes de enviar.`,
};

const MULTIPLE_CHOICE_BY_STEP: Record<string, ActivityStepContent> = {
  "step-1-2": {
    kind: "multiple_choice",
    question: "Qual atitude ajuda a estudar com segurança na internet?",
    options: [
      { id: "a", label: "Pedir ajuda quando tiver dúvida" },
      { id: "b", label: "Clicar em links desconhecidos sem ler" },
      { id: "c", label: "Usar senhas fáceis de adivinhar" },
      { id: "d", label: "Ignorar avisos de segurança" },
    ],
  },
  "step-2-3": {
    kind: "multiple_choice",
    question: "Qual campo indica para quem você está enviando o e-mail?",
    options: [
      { id: "para", label: 'Campo "Para"' },
      { id: "assunto", label: 'Campo "Assunto"' },
      { id: "corpo", label: "Corpo da mensagem" },
      { id: "anexos", label: "Anexos" },
    ],
  },
};

const OPEN_QUESTION_BY_STEP: Record<string, ActivityStepContent> = {
  "step-1-3": {
    kind: "open_question",
    question: "O que você gostaria de aprender primeiro no mundo digital?",
  },
  "step-4-3": {
    kind: "open_question",
    question: "Como você protege suas informações pessoais no dia a dia?",
  },
};

function buildDefaultContent(step: ActivityStepDto): ActivityStepContent {
  const specificReading = READING_BODY_BY_STEP[step.id];
  if (specificReading) {
    return { kind: "content_reading", body: specificReading };
  }

  if (step.id in MULTIPLE_CHOICE_BY_STEP) {
    return MULTIPLE_CHOICE_BY_STEP[step.id];
  }

  if (step.id in OPEN_QUESTION_BY_STEP) {
    return OPEN_QUESTION_BY_STEP[step.id];
  }

  return buildGenericContent(step.type ?? "content_reading", step.label);
}

function buildGenericContent(type: TaskStepType, label: string): ActivityStepContent {
  switch (type) {
    case "content_reading":
      return {
        kind: "content_reading",
        body: `Leia com atenção o conteúdo sobre "${label}". Role a página se precisar e toque em "Terminei de ler" quando concluir.`,
      };
    case "watch_content":
      return {
        kind: "watch_content",
        videoUrl: "",
      };
    case "multiple_choice":
      return {
        kind: "multiple_choice",
        question: `Pergunta sobre: ${label}`,
        options: [
          { id: "a", label: "Primeira opção" },
          { id: "b", label: "Segunda opção" },
          { id: "c", label: "Terceira opção" },
        ],
      };
    case "open_question":
      return {
        kind: "open_question",
        question: label,
      };
    default:
      return {
        kind: "content_reading",
        body: label,
      };
  }
}

export function enrichStepWithContent(step: ActivityStepDto): ActivityStepDto {
  if (step.content) {
    return step;
  }

  return {
    ...step,
    content: buildDefaultContent(step),
  };
}

export function enrichActivityStepsWithContent<T extends { steps: ActivityStepDto[] }>(
  activity: T,
): T {
  return {
    ...activity,
    steps: activity.steps.map((step) => enrichStepWithContent(step)),
  };
}
