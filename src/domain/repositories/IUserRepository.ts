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
  update(userId: string, input: UserUpdateInput): Promise<User>;
  delete(userId: string): Promise<void>;
}
