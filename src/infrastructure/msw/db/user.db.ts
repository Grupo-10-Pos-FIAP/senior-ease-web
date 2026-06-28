import type { UserDto } from '@infrastructure/mappers/user.mapper'

const store = new Map<string, UserDto>()

const DEMO_USER: UserDto = {
  id: 'demo-user',
  fullName: 'Antônio José Maria da Silva',
  birthDate: '1959-01-15',
  registrationId: '2026067',
  disability: 'Baixa visão',
  email: 'antoniojose@seniorease.com.br',
  phone: '(85) 96767-6767',
}

export function seedUserDb(): void {
  store.clear()
  store.set('demo-user', { ...DEMO_USER })
}

export function getUserFromDb(userId: string): UserDto | undefined {
  const user = store.get(userId)
  return user ? { ...user } : undefined
}

export function updateUserInDb(userId: string, dto: UserDto): UserDto {
  store.set(userId, { ...dto })
  return { ...dto }
}

export function deleteUserFromDb(userId: string): boolean {
  return store.delete(userId)
}

export function resetUserDb(): void {
  seedUserDb()
}

seedUserDb()
