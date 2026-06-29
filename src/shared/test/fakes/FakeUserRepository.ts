import { createUser, type User } from "@domain/entities/User";
import type { IUserRepository, UserUpdateInput } from "@domain/repositories/IUserRepository";

export class FakeUserRepository implements IUserRepository {
  private store = new Map<string, User>();

  constructor(initial?: User) {
    if (initial) {
      this.store.set(initial.id, initial);
    }
  }

  get(userId: string): Promise<User> {
    const user = this.store.get(userId);
    if (!user) {
      return Promise.reject(new Error(`Usuário não encontrado: ${userId}`));
    }
    return Promise.resolve(user);
  }

  update(userId: string, input: UserUpdateInput): Promise<User> {
    const current = this.store.get(userId);
    if (!current) {
      return Promise.reject(new Error(`Usuário não encontrado: ${userId}`));
    }

    const updated = createUser({
      id: current.id,
      fullName: input.fullName ?? current.fullName,
      birthDate: input.birthDate ?? current.birthDate,
      registrationId: input.registrationId ?? current.registrationId,
      disability: input.disability !== undefined ? input.disability : current.disability,
      email: input.email ?? current.email,
      phone: input.phone ?? current.phone,
    });

    this.store.set(userId, updated);
    return Promise.resolve(updated);
  }

  delete(userId: string): Promise<void> {
    if (!this.store.has(userId)) {
      return Promise.reject(new Error(`Usuário não encontrado: ${userId}`));
    }
    this.store.delete(userId);
    return Promise.resolve();
  }
}
