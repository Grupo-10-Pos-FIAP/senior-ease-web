export function formatTaskDateRange(startDate: string, endDate: string): string {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const start = formatter.format(new Date(`${startDate}T00:00:00`))
  const end = formatter.format(new Date(`${endDate}T00:00:00`))

  return `${start} – ${end}`
}
