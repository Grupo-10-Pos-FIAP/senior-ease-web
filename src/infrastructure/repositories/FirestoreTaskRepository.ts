import type { Task } from "@domain/entities/Task";
import { TaskNotFoundError } from "@domain/errors/TaskNotFoundError";
import type { ITaskRepository } from "@domain/repositories/ITaskRepository";
import { getFirestoreDb } from "@infrastructure/firebase/client";
import { fromTaskDto, toTaskDto, type TaskDto } from "@infrastructure/mappers/task.mapper";
import { collection, doc, getDoc, getDocs, updateDoc } from "firebase/firestore";

export class FirestoreTaskRepository implements ITaskRepository {
  constructor(private readonly getCurrentUserId: () => string) {}

  private tasksCollection(userId: string) {
    return collection(getFirestoreDb(), "users", userId, "tasks");
  }

  async list(userId: string): Promise<Task[]> {
    const snapshot = await getDocs(this.tasksCollection(userId));
    return snapshot.docs.map((taskDoc) => fromTaskDto(taskDoc.data() as TaskDto));
  }

  async getById(id: string): Promise<Task> {
    const userId = this.getCurrentUserId();
    const snapshot = await getDoc(doc(getFirestoreDb(), "users", userId, "tasks", id));

    if (!snapshot.exists()) {
      throw new TaskNotFoundError(id);
    }

    return fromTaskDto(snapshot.data() as TaskDto);
  }

  async complete(taskId: string): Promise<Task> {
    const userId = this.getCurrentUserId();
    const taskRef = doc(getFirestoreDb(), "users", userId, "tasks", taskId);
    const snapshot = await getDoc(taskRef);

    if (!snapshot.exists()) {
      throw new TaskNotFoundError(taskId);
    }

    const current = snapshot.data() as TaskDto;
    const completed: TaskDto = {
      ...current,
      status: "completed",
      steps: current.steps.map((step) => ({ ...step, completed: true })),
    };

    await updateDoc(taskRef, completed as unknown as Record<string, unknown>);
    return fromTaskDto(completed);
  }
}

export { toTaskDto };
