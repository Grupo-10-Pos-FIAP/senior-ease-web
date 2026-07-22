import { ACTIVE_ACCOUNT_LIFECYCLE, createDeactivatedLifecycle } from "@domain/accountLifecycle";
import type { UserDto } from "@infrastructure/mappers/user.mapper";

const store = new Map<string, UserDto>();

const DEMO_USER: UserDto = {
  id: "demo-user",
  fullName: "Antônio José Maria da Silva",
  birthDate: "1959-01-15",
  registrationId: "2026067",
  disability: "Baixa visão",
  email: "antoniojose@seniorease.com.br",
  phone: "(85) 96767-6767",
  accountStatus: "active",
  deactivatedAt: null,
  purgeAt: null,
};

export function seedUserDb(): void {
  store.clear();
  store.set("demo-user", { ...DEMO_USER });
}

export function getUserFromDb(userId: string): UserDto | undefined {
  const user = store.get(userId);
  return user ? { ...user } : undefined;
}

export function updateUserInDb(userId: string, dto: UserDto): UserDto {
  store.set(userId, { ...dto });
  return { ...dto };
}

export function deactivateUserInDb(userId: string): UserDto | undefined {
  const current = store.get(userId);
  if (!current) return undefined;

  const lifecycle = createDeactivatedLifecycle();
  const updated: UserDto = {
    ...current,
    accountStatus: lifecycle.accountStatus,
    deactivatedAt: lifecycle.deactivatedAt,
    purgeAt: lifecycle.purgeAt,
  };
  store.set(userId, updated);
  return { ...updated };
}

export function reactivateUserInDb(userId: string): UserDto | undefined {
  const current = store.get(userId);
  if (!current) return undefined;

  const updated: UserDto = {
    ...current,
    accountStatus: ACTIVE_ACCOUNT_LIFECYCLE.accountStatus,
    deactivatedAt: null,
    purgeAt: null,
  };
  store.set(userId, updated);
  return { ...updated };
}

export function deleteUserFromDb(userId: string): boolean {
  return store.delete(userId);
}

export function resetUserDb(): void {
  seedUserDb();
}

seedUserDb();
