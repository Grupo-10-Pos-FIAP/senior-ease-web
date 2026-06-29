import type { TaskStepType } from "@domain/value-objects/TaskStepType";

export const TASK_STEP_TYPE_LABELS: Record<TaskStepType, string> = {
  multiple_choice: "Múltipla escolha",
  open_question: "Questão aberta",
  content_reading: "Leitura de conteúdo",
  watch_content: "Assistir conteúdo",
};

export const TASK_STEP_TYPE_DESCRIPTIONS: Record<TaskStepType, string> = {
  multiple_choice: "Escolha uma resposta tocando no botão redondo da opção correta.",
  open_question: "Escreva sua resposta com suas próprias palavras.",
  content_reading: "Leia o texto com calma até o final antes de avançar.",
  watch_content: "Assista ao vídeo e use os controles de play e volume.",
};

export function getTaskStepTypeLabel(type: TaskStepType): string {
  return TASK_STEP_TYPE_LABELS[type];
}

export function getTaskStepTypeDescription(type: TaskStepType): string {
  return TASK_STEP_TYPE_DESCRIPTIONS[type];
}

export const GUIDE_STEP_ACTION_LABEL = "Como fazer esta tarefa?";

export function getTaskStepGuideActionLabel(): string {
  return GUIDE_STEP_ACTION_LABEL;
}
