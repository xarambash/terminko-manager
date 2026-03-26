export const inputSelectClass =
  'w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]'

export function formatPrice(value: string | number): string {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value
  if (Number.isNaN(n)) return String(value)
  return n.toFixed(2)
}

export function formatFreeDayDate(isoOrDate: string): string {
  if (isoOrDate.includes('T')) return isoOrDate.split('T')[0] ?? isoOrDate
  return isoOrDate.slice(0, 10)
}

export const timeRe = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/

export function parseTimeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return (h ?? 0) * 60 + (m ?? 0)
}

/** `dayOfWeek` 0 = Sunday … 6 = Saturday; uses locale for weekday name */
export function formatWeekdayLong(dayOfWeek: number, locale: string): string {
  const d = new Date(2024, 0, 7 + dayOfWeek)
  return d.toLocaleDateString(locale, { weekday: 'long' })
}
