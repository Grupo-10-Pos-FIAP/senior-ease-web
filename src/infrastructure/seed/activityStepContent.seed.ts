import type { ActivityStepContent } from "@domain/value-objects/ActivityStepContent";
import type { TaskStepType } from "@domain/value-objects/TaskStepType";
import type { ActivityStepDto } from "@infrastructure/mappers/activity.mapper";

const YOUTUBE = {
  importanciaEducacaoDigital: "https://www.youtube.com/watch?v=qzgmDZphKVE",
  videochamadaWhatsApp: "https://www.youtube.com/watch?v=RyTpp9cAmgM",
  internetSegura60Parte1: "https://www.youtube.com/watch?v=XxR-LYiZ52c",
  condutaRedesSociais: "https://www.youtube.com/watch?v=eu33fL_7oeg",
  internetBanking: "https://www.youtube.com/watch?v=fz2yftvmInw",
  programasComputador: "https://www.youtube.com/watch?v=I_kHRpzA268",
  googleFuncionalidades: "https://www.youtube.com/watch?v=wkjJYfTR6oo",
  whatsapp: "https://www.youtube.com/watch?v=yaBSW7lBsmY",
} as const;

const READING_BODY_BY_STEP: Record<string, string> = {
  "step-1-1": `Hoje, muitos serviços importantes estão no celular ou no computador: consultar o benefício do INSS, agendar consultas de saúde, falar com a família e pagar contas.

Você não precisa aprender tudo de uma vez. Cada pessoa tem seu ritmo, e errar faz parte do caminho. O importante é começar com calma e pedir ajuda quando algo não estiver claro.

Com prática e paciência, a tecnologia pode se tornar uma aliada na sua rotina.`,
  "step-2-1": `Para ver suas mensagens, abra o programa ou site de e-mail e faça login com seu usuário e senha. Na tela principal, procure a pasta "Caixa de entrada" ou "Inbox".

As mensagens novas aparecem em ordem, geralmente com a mais recente no topo. Toque ou clique em uma mensagem para ler o conteúdo completo.

Mensagens lidas costumam ficar com aparência diferente das não lidas. Você também pode encontrar pastas como "Lixo" e "Spam" — é lá que vão mensagens indesejadas ou suspeitas.`,
  "step-2-2": `Para escrever uma mensagem, procure o botão "Novo", "Escrever" ou um ícone de lápis. Preencha o campo "Para" com o e-mail de quem vai receber.

No campo "Assunto", escreva um resumo curto do que a mensagem trata. No corpo, escreva sua mensagem com calma e revise antes de enviar.

Evite responder a e-mails de desconhecidos ou que pedem dados pessoais, senhas ou dinheiro com urgência.`,
  "step-3-2": `Antes de uma videochamada, vale preparar o ambiente com calma. Procure um lugar silencioso, com boa luz no rosto e o celular ou computador na altura dos olhos.

Teste o microfone e a câmera antes de ligar. Se possível, use uma rede Wi-Fi estável. Avise a família do horário para que todos estejam prontos.

Se algo der errado no começo, não se preocupe. Desligue, respire e tente de novo.`,
  "step-4-1": `Na internet, golpistas costumam usar urgência para apressar a vítima. Fique atento a mensagens falsas do INSS por SMS, ao golpe do "filho que trocou de número" no WhatsApp e a links que imitam sites do governo.

Desconfie de pedidos de dinheiro, códigos de verificação ou dados pessoais por mensagem. Órgãos oficiais como o INSS não pedem CPF, selfie ou senha por link desconhecido.

Quando tiver dúvida, pare e confirme por um canal que você já conhece — ligando para a pessoa ou acessando o site oficial digitando o endereço você mesmo.`,
  "step-5-1": `Um currículo digital apresenta quem você é de forma profissional: nome, telefone, e-mail e um resumo das suas experiências de trabalho, cursos ou voluntariado.

Inclua apenas informações necessárias para a vaga. Não coloque CPF completo, RG, número de conta bancária ou endereço completo com detalhes que exponham demais.

Uma foto profissional é opcional. Revise a ortografia e peça para alguém de confiança ler antes de enviar.`,
  "step-6-2": `Em entrevistas por vídeo, o ambiente conta tanto quanto suas respostas. Escolha um lugar silencioso, com boa iluminação e fundo organizado.

Vista-se como se fosse presencialmente. Posicione a câmera na altura dos olhos e feche notificações do celular ou computador para não se distrair.

Tenha água por perto e teste câmera e microfone antes do horário marcado.`,
  "step-7-1": `No dia a dia, a tecnologia aparece em situações reais: agendar consulta pelo aplicativo do SUS, receber resultado de exame por e-mail, fazer a prova de vida do INSS ou consultar o extrato do benefício.

Em cada caso, use canais oficiais — aplicativos do governo, sites que terminam em .gov.br ou agências que você já conhece.

Se algo parecer estranho ou urgente demais, pare e peça ajuda antes de clicar ou informar dados.`,
  "step-8-1": `Para comprar pela internet com mais segurança, prefira lojas conhecidas ou sites com endereço que começa com https e mostra o cadeado no navegador.

Desconfie de ofertas "boas demais" e de links enviados por WhatsApp de desconhecidos. Faça o pagamento dentro do site ou aplicativo oficial, não por link externo.

Guarde o comprovante da compra e confira o extrato do banco nos dias seguintes.`,
  "step-9-1": `No computador, os arquivos ficam organizados em pastas. As mais usadas são Documentos, Downloads e Área de Trabalho.

A pasta Downloads guarda o que você baixou da internet — como exames em PDF ou fotos. Vale criar pastas com nomes claros, por exemplo "Receitas médicas 2026".

Antes de apagar qualquer arquivo, abra e confira se é realmente o que você não precisa mais.`,
  "step-10-1": `Para pesquisar na internet, use palavras simples no Google ou em outro buscador. Exemplo: "horário posto de saúde" em vez de frases muito longas.

Prefira sites oficiais (que terminam em .gov.br) e fontes conhecidas. Desconfie de títulos sensacionalistas como "cura milagrosa" ou "urgente — compartilhe agora".

Quando a informação for sobre saúde, dinheiro ou benefícios, confirme em um canal oficial antes de acreditar ou repassar.`,
  "step-12-1": `O WhatsApp permite enviar mensagens de texto, áudios, fotos e fazer chamadas de voz ou vídeo com familiares e amigos.

Para enviar uma mensagem, abra a conversa, digite no campo de texto e toque no botão de enviar. Para gravar áudio, segure o ícone do microfone.

Cuidado com o golpe do código: se alguém pedir o código de 6 dígitos que chegou no seu SMS, nunca passe. Isso serve para clonar sua conta.`,
  "step-13-1": `Organizar o orçamento mensal ajuda a ter mais tranquilidade. Anote suas entradas (aposentadoria, benefício, pensão) e suas saídas fixas (aluguel, remédios, mercado, contas de luz e água).

Você pode usar um caderno, uma planilha simples no computador ou o aplicativo do banco. O importante é registrar e revisar todo mês.

Se preferir, peça ajuda a um familiar de confiança na primeira vez.`,
};

const MULTIPLE_CHOICE_BY_STEP: Record<string, ActivityStepContent> = {
  "step-1-2": {
    kind: "multiple_choice",
    question:
      "Serviços públicos e bancos estão cada vez mais no celular. Qual é a melhor forma de começar?",
    options: [
      { id: "a", label: "Começar com uma tarefa simples e pedir ajuda de alguém de confiança" },
      { id: "b", label: "Tentar aprender tudo de uma vez sem pausa" },
      { id: "c", label: "Clicar em qualquer link que aparecer na tela" },
      { id: "d", label: "Compartilhar sua senha com um familiar para ele configurar" },
    ],
  },
  "step-2-3": {
    kind: "multiple_choice",
    question:
      "Você recebeu um e-mail dizendo que seu benefício do INSS será cancelado e pede CPF e selfie por um link. O que fazer?",
    options: [
      { id: "a", label: "Não clicar no link; acessar o app Meu INSS ou ligar para o 135" },
      { id: "b", label: "Clicar no link e enviar os dados para resolver rápido" },
      { id: "c", label: "Responder o e-mail com seu CPF e senha" },
      { id: "d", label: "Encaminhar o e-mail para todos os seus contatos" },
    ],
  },
  "step-3-3": {
    kind: "multiple_choice",
    question: "Antes de uma videochamada com um familiar, o que mais ajuda?",
    options: [
      { id: "a", label: "Testar câmera e microfone com calma antes" },
      { id: "b", label: "Ligar sem testar nada para não perder tempo" },
      { id: "c", label: "Ficar de costas para a janela, sem luz no rosto" },
      { id: "d", label: "Deixar o volume no mínimo para não incomodar" },
    ],
  },
  "step-4-2": {
    kind: "multiple_choice",
    question: "No WhatsApp: 'Sou seu filho, troquei de número, preciso de Pix agora'. O que fazer?",
    options: [
      { id: "a", label: "Ligar para o número antigo do filho antes de enviar qualquer valor" },
      { id: "b", label: "Enviar o Pix imediatamente para não deixá-lo na mão" },
      { id: "c", label: "Passar sua senha do banco para ele resolver" },
      { id: "d", label: "Compartilhar o código de verificação do WhatsApp" },
    ],
  },
  "step-5-2": {
    kind: "multiple_choice",
    question: "O que NÃO deve aparecer em um currículo enviado pela internet?",
    options: [
      { id: "a", label: "CPF completo e número da conta bancária" },
      { id: "b", label: "Telefone e e-mail para contato" },
      { id: "c", label: "Experiências de trabalho anteriores" },
      { id: "d", label: "Cursos que você concluiu" },
    ],
  },
  "step-6-3": {
    kind: "multiple_choice",
    question: "Durante uma entrevista online, o que passa mais confiança?",
    options: [
      { id: "a", label: "Olhar para a câmera e ouvir a pergunta até o fim antes de responder" },
      { id: "b", label: "Responder rápido, mesmo sem entender a pergunta" },
      { id: "c", label: "Ficar olhando para o chão durante toda a conversa" },
      { id: "d", label: "Deixar o microfone desligado o tempo todo" },
    ],
  },
  "step-7-2": {
    kind: "multiple_choice",
    question: "Para fazer a prova de vida do INSS com segurança, onde devo acessar?",
    options: [
      { id: "a", label: "App Meu INSS ou agência oficial — nunca por link de SMS" },
      { id: "b", label: "Qualquer link que chegar por mensagem de texto" },
      { id: "c", label: "Site que um desconhecido enviou no WhatsApp" },
      { id: "d", label: "Formulário em rede social que pede selfie e CPF" },
    ],
  },
  "step-8-3": {
    kind: "multiple_choice",
    question: "Qual sinal ajuda a identificar um site de compras mais confiável?",
    options: [
      { id: "a", label: "Endereço começa com https e mostra cadeado no navegador" },
      { id: "b", label: "Preço muito abaixo do normal em qualquer site" },
      { id: "c", label: "Link recebido de número desconhecido no WhatsApp" },
      { id: "d", label: "Site que pede senha do banco por mensagem" },
    ],
  },
  "step-9-2": {
    kind: "multiple_choice",
    question: "Você baixou um exame em PDF. Em qual pasta ele costuma ficar primeiro?",
    options: [
      { id: "a", label: "Downloads" },
      { id: "b", label: "Lixeira" },
      { id: "c", label: "Pasta de fotos da câmera" },
      { id: "d", label: "Área de trabalho do vizinho" },
    ],
  },
  "step-10-2": {
    kind: "multiple_choice",
    question:
      "Você viu uma notícia dizendo que um remédio 'cura tudo'. O que fazer antes de compartilhar?",
    options: [
      { id: "a", label: "Verificar em site de saúde oficial ou perguntar ao médico" },
      { id: "b", label: "Compartilhar imediatamente para ajudar os amigos" },
      { id: "c", label: "Comprar o remédio pelo link da mensagem" },
      { id: "d", label: "Parar de tomar seus remédios atuais" },
    ],
  },
  "step-11-2": {
    kind: "multiple_choice",
    question: "Para salvar um documento no computador Windows, qual atalho usar?",
    options: [
      { id: "a", label: "Ctrl + S" },
      { id: "b", label: "Ctrl + P" },
      { id: "c", label: "Alt + F4" },
      { id: "d", label: "Ctrl + Z" },
    ],
  },
  "step-12-2": {
    kind: "multiple_choice",
    question:
      "Um desconhecido pede o código que chegou no seu SMS para 'confirmar o WhatsApp'. O que fazer?",
    options: [
      { id: "a", label: "Não passar o código — é golpe para clonar sua conta" },
      { id: "b", label: "Enviar o código para liberar o acesso" },
      { id: "c", label: "Ligar para o desconhecido e passar sua senha também" },
      { id: "d", label: "Instalar um aplicativo que ele indicar" },
    ],
  },
};

const OPEN_QUESTION_BY_STEP: Record<string, ActivityStepContent> = {
  "step-1-3": {
    kind: "open_question",
    question:
      "O que você gostaria de fazer primeiro com o celular ou computador? (ex.: ligar para a família, ver resultado de exame, pagar uma conta)",
  },
  "step-4-3": {
    kind: "open_question",
    question: "Você ou alguém da família já recebeu mensagem suspeita? O que fizeram?",
  },
  "step-5-3": {
    kind: "open_question",
    question:
      "Descreva uma experiência de trabalho, voluntariado ou cuidado com a família da qual você se orgulha.",
  },
  "step-7-3": {
    kind: "open_question",
    question: "Conte uma vez em que a tecnologia te ajudou — ou te deixou com medo — no dia a dia.",
  },
  "step-13-2": {
    kind: "open_question",
    question:
      "Como você organiza suas contas hoje: caderno, planilha, app do banco ou com ajuda da família?",
  },
};

const WATCH_CONTENT_BY_STEP: Record<string, ActivityStepContent> = {
  "step-1-4": {
    kind: "watch_content",
    videoUrl: YOUTUBE.importanciaEducacaoDigital,
  },
  "step-3-1": {
    kind: "watch_content",
    videoUrl: YOUTUBE.videochamadaWhatsApp,
  },
  "step-4-4": {
    kind: "watch_content",
    videoUrl: YOUTUBE.internetSegura60Parte1,
  },
  "step-6-1": {
    kind: "watch_content",
    videoUrl: YOUTUBE.condutaRedesSociais,
  },
  "step-8-2": {
    kind: "watch_content",
    videoUrl: YOUTUBE.internetBanking,
  },
  "step-11-1": {
    kind: "watch_content",
    videoUrl: YOUTUBE.programasComputador,
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

  if (step.id in WATCH_CONTENT_BY_STEP) {
    return WATCH_CONTENT_BY_STEP[step.id];
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
