import type { AccountLifecycle } from "@domain/accountLifecycle";
import type { User } from "@domain/entities/User";

export interface UserUpdateInput {
  fullName?: string;
  birthDate?: string;
  registrationId?: string;
  disability?: string | null;
  email?: string;
  phone?: string;
}

export interface IUserRepository {
  get(userId: string): Promise<User>;
  getAccountLifecycle(userId: string): Promise<AccountLifecycle>;
  update(userId: string, input: UserUpdateInput): Promise<User>;
  deactivate(userId: string): Promise<AccountLifecycle>;
  reactivate(userId: string): Promise<AccountLifecycle>;
  /** Exclusão permanente (purge após 90 dias ou safety net). */
  delete(userId: string): Promise<void>;
}
