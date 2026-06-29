export class TaskStepNotCompletableError extends Error {
  constructor(
    public readonly taskId: string,
    public readonly stepId: string,
  ) {
    super(`A tarefa "${stepId}" não pode ser concluída no estado atual da atividade "${taskId}"`);
    this.name = "TaskStepNotCompletableError";
  }
}
