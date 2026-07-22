import {
  normalizeAccountLifecycle,
  type AccountLifecycle,
  type AccountStatus,
} from "@domain/accountLifecycle";
import { createUser, type User } from "@domain/entities/User";

export interface UserDto {
  id: string;
  fullName: string;
  birthDate?: string;
  /** Campo legado do Firestore — convertido para birthDate na leitura. */
  age?: number;
  registrationId: string;
  disability: string | null;
  email: string;
  phone: string;
  accountStatus?: AccountStatus;
  deactivatedAt?: string | null;
  purgeAt?: string | null;
}

export function ageToBirthDate(age: number): string {
  const year = new Date().getFullYear() - age;
  return `${String(year)}-01-01`;
}

function resolveBirthDate(dto: Pick<UserDto, "birthDate" | "age">): string {
  const birthDate = dto.birthDate?.trim();
  if (birthDate) return birthDate;

  if (typeof dto.age === "number" && dto.age >= 1 && dto.age <= 120) {
    return ageToBirthDate(dto.age);
  }

  return "";
}

function normalizePhoneFromStorage(phone: string | undefined): string {
  const value = phone?.trim() ?? "";
  if (!value || value === "-") return "";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return "";
  return value;
}

/**
 * Mapeia dados persistidos para a entidade de domínio sem validação estrita.
 * A validação completa ocorre ao salvar via `createUser`.
 */
export function fromUserDto(dto: UserDto): User {
  return {
    id: dto.id,
    fullName: dto.fullName.trim() || "Complete seu perfil",
    birthDate: resolveBirthDate(dto),
    registrationId: dto.registrationId.trim() || "-",
    disability: dto.disability ?? null,
    email: dto.email.trim() || "",
    phone: normalizePhoneFromStorage(dto.phone),
  };
}

export function fromAccountLifecycleDto(dto: {
  accountStatus?: AccountStatus | null;
  deactivatedAt?: string | null;
  purgeAt?: string | null;
}): AccountLifecycle {
  return normalizeAccountLifecycle({
    accountStatus: dto.accountStatus,
    deactivatedAt: dto.deactivatedAt,
    purgeAt: dto.purgeAt,
  });
}

export function toUserDto(user: User, lifecycle?: AccountLifecycle): UserDto {
  const account = lifecycle ?? normalizeAccountLifecycle({});
  return {
    id: user.id,
    fullName: user.fullName,
    birthDate: user.birthDate,
    registrationId: user.registrationId,
    disability: user.disability,
    email: user.email,
    phone: user.phone,
    accountStatus: account.accountStatus,
    deactivatedAt: account.deactivatedAt,
    purgeAt: account.purgeAt,
  };
}

export function toValidatedUser(dto: UserDto): User {
  const mapped = fromUserDto(dto);
  return createUser(mapped);
}
