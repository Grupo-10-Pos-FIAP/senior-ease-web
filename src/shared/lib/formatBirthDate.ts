const ISO_BIRTH_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

export function isoToBirthDateDisplay(iso: string): string {
  const match = ISO_BIRTH_DATE_PATTERN.exec(iso.trim())
  if (!match) return ''
  const [, year, month, day] = match
  return `${day}/${month}/${year}`
}

export function birthDateDisplayToIso(display: string): string | null {
  const digits = display.replace(/\D/g, '')
  if (digits.length !== 8) return null

  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)

  return `${year}-${month}-${day}`
}

export function formatBirthDateMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}
