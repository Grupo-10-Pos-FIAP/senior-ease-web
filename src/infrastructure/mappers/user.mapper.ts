import { createUser, type User } from '@domain/entities/User'

export interface UserDto {
  id: string
  fullName: string
  birthDate?: string
  /** Campo legado do Firestore — convertido para birthDate na leitura. */
  age?: number
  registrationId: string
  disability: string | null
  email: string
  phone: string
}

export function ageToBirthDate(age: number): string {
  const year = new Date().getFullYear() - age
  return `${year}-01-01`
}

function resolveBirthDate(dto: Pick<UserDto, 'birthDate' | 'age'>): string {
  const birthDate = dto.birthDate?.trim()
  if (birthDate) return birthDate

  if (typeof dto.age === 'number' && dto.age >= 1 && dto.age <= 120) {
    return ageToBirthDate(dto.age)
  }

  return ''
}

function normalizePhoneFromStorage(phone: string | undefined): string {
  const value = phone?.trim() ?? ''
  if (!value || value === '-') return ''
  const digits = value.replace(/\D/g, '')
  if (digits.length < 10) return ''
  return value
}

/**
 * Mapeia dados persistidos para a entidade de domínio sem validação estrita.
 * A validação completa ocorre ao salvar via `createUser`.
 */
export function fromUserDto(dto: UserDto): User {
  return {
    id: dto.id,
    fullName: dto.fullName?.trim() || 'Complete seu perfil',
    birthDate: resolveBirthDate(dto),
    registrationId: dto.registrationId?.trim() || '-',
    disability: dto.disability ?? null,
    email: dto.email?.trim() ?? '',
    phone: normalizePhoneFromStorage(dto.phone),
  }
}

export function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    fullName: user.fullName,
    birthDate: user.birthDate,
    registrationId: user.registrationId,
    disability: user.disability,
    email: user.email,
    phone: user.phone,
  }
}

export function toValidatedUser(dto: UserDto): User {
  const mapped = fromUserDto(dto)
  return createUser(mapped)
}
