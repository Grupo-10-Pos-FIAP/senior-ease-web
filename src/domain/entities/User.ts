export interface User {
  id: string
  fullName: string
  birthDate: string
  registrationId: string
  disability: string | null
  email: string
  phone: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const BIRTH_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const MIN_AGE = 1
const MAX_AGE = 120

function parseBirthDate(value: string): Date {
  const trimmed = value.trim()
  if (!BIRTH_DATE_PATTERN.test(trimmed)) {
    throw new Error('Data de nascimento inválida')
  }

  const [year, month, day] = trimmed.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new Error('Data de nascimento inválida')
  }

  return date
}

export function calculateAgeFromBirthDate(
  birthDate: string,
  referenceDate: Date = new Date(),
): number {
  const birth = parseBirthDate(birthDate)
  const ref = new Date(referenceDate)
  ref.setHours(0, 0, 0, 0)
  birth.setHours(0, 0, 0, 0)

  let age = ref.getFullYear() - birth.getFullYear()
  const monthDiff = ref.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < birth.getDate())) {
    age--
  }

  return age
}

export function createUser(input: {
  id: string
  fullName: string
  birthDate: string
  registrationId: string
  disability?: string | null
  email: string
  phone: string
}): User {
  const fullName = input.fullName.trim()
  if (!fullName) {
    throw new Error('Nome completo é obrigatório')
  }

  const birthDate = input.birthDate.trim()
  const birth = parseBirthDate(birthDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (birth > today) {
    throw new Error('Data de nascimento não pode ser no futuro')
  }

  const age = calculateAgeFromBirthDate(birthDate)
  if (age < MIN_AGE || age > MAX_AGE) {
    throw new Error('Idade deve estar entre 1 e 120 anos')
  }

  const registrationId = input.registrationId.trim()
  if (!registrationId) {
    throw new Error('Matrícula é obrigatória')
  }

  const email = input.email.trim()
  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new Error('E-mail inválido')
  }

  const phone = input.phone.trim()
  if (!phone) {
    throw new Error('Telefone é obrigatório')
  }

  const phoneDigits = phone.replace(/\D/g, '')
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    throw new Error('Telefone inválido')
  }

  const disability = input.disability?.trim() ?? null

  return {
    id: input.id,
    fullName,
    birthDate,
    registrationId,
    disability: disability || null,
    email,
    phone,
  }
}

export function formatUserAge(birthDate: string): string {
  if (!birthDate.trim()) {
    return 'Não informada'
  }

  const age = calculateAgeFromBirthDate(birthDate)
  return `${age} ${age === 1 ? 'ano' : 'anos'}`
}

export function formatUserDisability(disability: string | null): string {
  return disability ?? 'Nenhuma'
}
