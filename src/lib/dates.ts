const DAY_IN_MS = 24 * 60 * 60 * 1000

/** Parse a `yyyy-mm-dd` value as a local date (avoids timezone shifts). */
export function parseDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`)
}

export function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function toDateInput(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function dateFromToday(days: number) {
  return toDateInput(addDays(new Date(), days))
}

export function todayInput() {
  return toDateInput(new Date())
}

export function asDate(value: string) {
  return value.length <= 10 ? parseDate(value) : new Date(value)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(asDate(value))
}

export function formatDateShort(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
  }).format(asDate(value))
}

export function formatDateLong(date: Date) {
  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatRelative(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.floor(diffMs / 60000)

  if (minutes < 1) return "À l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours} h`

  const days = Math.floor(hours / 24)
  if (days === 1) return 'Hier'
  if (days < 30) return `Il y a ${days} j`

  return formatDate(value)
}

export function daysUntil(value: string) {
  const target = parseDate(value)
  const today = startOfToday()
  return Math.round((target.getTime() - today.getTime()) / DAY_IN_MS)
}

export function differenceInDays(start: string, end: string) {
  const startDate = parseDate(start)
  const endDate = parseDate(end)
  return Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / DAY_IN_MS))
}

export function dueLabel(endDate: string) {
  const days = daysUntil(endDate)

  if (days < 0) return `En retard de ${Math.abs(days)} ${Math.abs(days) > 1 ? 'jours' : 'jour'}`
  if (days === 0) return "Retour aujourd'hui"
  if (days === 1) return 'Retour demain'
  if (days <= 14) return `Dans ${days} jours`
  return `Le ${formatDate(endDate)}`
}

export function dueLabelCompact(endDate: string) {
  const days = daysUntil(endDate)

  if (days < 0) return `${Math.abs(days)} j de retard`
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Demain'
  if (days <= 14) return `Dans ${days} j`
  return formatDateShort(endDate)
}
