import {
  ACTIVE_ACCOUNT_LIFECYCLE,
  createDeactivatedLifecycle,
  type AccountLifecycle,
} from "@domain/accountLifecycle";
import { createUser, type User } from "@domain/entities/User";
import type { IUserRepository, UserUpdateInput } from "@domain/repositories/IUserRepository";

export class FakeUserRepository implements IUserRepository {
  private store = new Map<string, User>();
  private lifecycles = new Map<string, AccountLifecycle>();

  constructor(initial?: User) {
    if (initial) {
      this.store.set(initial.id, initial);
      this.lifecycles.set(initial.id, ACTIVE_ACCOUNT_LIFECYCLE);
    }
  }

  get(userId: string): Promise<User> {
    const user = this.store.get(userId);
    if (!user) {
      return Promise.reject(new Error(`Usuário não encontrado: ${userId}`));
    }
    return Promise.resolve(user);
  }

  getAccountLifecycle(userId: string): Promise<AccountLifecycle> {
    if (!this.store.has(userId)) {
      return Promise.reject(new Error(`Usuário não encontrado: ${userId}`));
    }
    return Promise.resolve(this.lifecycles.get(userId) ?? ACTIVE_ACCOUNT_LIFECYCLE);
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

  deactivate(userId: string): Promise<AccountLifecycle> {
    if (!this.store.has(userId)) {
      return Promise.reject(new Error(`Usuário não encontrado: ${userId}`));
    }

    const lifecycle = createDeactivatedLifecycle();
    this.lifecycles.set(userId, lifecycle);
    return Promise.resolve(lifecycle);
  }

  reactivate(userId: string): Promise<AccountLifecycle> {
    if (!this.store.has(userId)) {
      return Promise.reject(new Error(`Usuário não encontrado: ${userId}`));
    }

    this.lifecycles.set(userId, ACTIVE_ACCOUNT_LIFECYCLE);
    return Promise.resolve(ACTIVE_ACCOUNT_LIFECYCLE);
  }

  delete(userId: string): Promise<void> {
    if (!this.store.has(userId)) {
      return Promise.reject(new Error(`Usuário não encontrado: ${userId}`));
    }
    this.store.delete(userId);
    this.lifecycles.delete(userId);
    return Promise.resolve();
  }
}
