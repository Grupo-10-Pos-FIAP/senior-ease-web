export class TaskNotCompletableError extends Error {
  constructor(taskId: string) {
    super(`A atividade "${taskId}" não pode ser concluída no estado atual`);
    this.name = "TaskNotCompletableError";
  }
}
