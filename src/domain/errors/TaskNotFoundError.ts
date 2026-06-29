export class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Atividade não encontrada: ${taskId}`);
    this.name = "TaskNotFoundError";
  }
}
