import type { ActivityProgress } from "@domain/entities/Task";
import type { InterfaceMode } from "@domain/value-objects/InterfaceMode";

export const ACTIVITY_PRIMARY_ACTION_LABEL = {
  not_started: "Iniciar a atividade",
  in_progress: "Continuar a atividade",
} as const;

export function getEffectiveActivityProgress(progress: ActivityProgress | null): ActivityProgress {
  return progress ?? "not_started";
}

export function getActivityPrimaryActionLabel(
  progress: ActivityProgress | null,
  interfaceMode: InterfaceMode = "simplified",
): string {
  const effectiveProgress = getEffectiveActivityProgress(progress);

  if (interfaceMode === "standard") {
    return effectiveProgress === "in_progress" ? "Continuar" : "Iniciar";
  }

  return ACTIVITY_PRIMARY_ACTION_LABEL[effectiveProgress];
}

export function getTutorialCompleteDescription(
  taskTitle: string,
  progress: ActivityProgress | null,
): string {
  const actionVerb =
    getEffectiveActivityProgress(progress) === "in_progress" ? "continuar" : "iniciar";

  return `Você viu todas as tarefas de "${taskTitle}" e já sabe como fazer cada uma. Deseja ${actionVerb} agora ou voltar para Minhas atividades?`;
}

export function getStartActivityConfirmOptions(taskTitle: string) {
  return {
    title: "Iniciar esta atividade?",
    description: `Você está prestes a começar "${taskTitle}". Deseja continuar agora?`,
    confirmLabel: "Sim, iniciar",
    cancelLabel: "Não, ainda não",
    alwaysConfirm: true as const,
  };
}
