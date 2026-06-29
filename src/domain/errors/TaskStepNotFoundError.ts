export class TaskStepNotFoundError extends Error {
  constructor(
    public readonly taskId: string,
    public readonly stepId: string,
  ) {
    super(`Tarefa "${stepId}" não encontrada na atividade "${taskId}"`);
    this.name = "TaskStepNotFoundError";
  }
}
