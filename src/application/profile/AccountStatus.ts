import type { AccountLifecycle } from "@domain/accountLifecycle";
import type { IUserRepository } from "@domain/repositories/IUserRepository";

export class GetAccountLifecycle {
  constructor(private readonly repository: IUserRepository) {}

  execute(userId: string): Promise<AccountLifecycle> {
    return this.repository.getAccountLifecycle(userId);
  }
}

export class DeactivateUser {
  constructor(private readonly repository: IUserRepository) {}

  execute(userId: string): Promise<AccountLifecycle> {
    return this.repository.deactivate(userId);
  }
}

export class ReactivateUser {
  constructor(private readonly repository: IUserRepository) {}

  execute(userId: string): Promise<AccountLifecycle> {
    return this.repository.reactivate(userId);
  }
}
