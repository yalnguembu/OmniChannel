import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDate(date: string | Date | undefined | null, fmt = 'dd MMM yyyy'): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return format(d, fmt, { locale: fr })
}

export function formatDateTime(date: string | Date | undefined | null): string {
  return formatDate(date, 'dd MMM yyyy HH:mm')
}

export function formatRelative(date: string | Date | undefined | null): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(d)) return '—'
  return formatDistanceToNow(d, { addSuffix: true, locale: fr })
}

export function formatPeriod(start?: string, end?: string): string {
  if (!start || !end) return '—'
  return `${formatDate(start)} – ${formatDate(end)}`
}
