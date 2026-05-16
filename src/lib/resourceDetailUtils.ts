export function formatPrice(value: string | number): string {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value
  if (Number.isNaN(n)) return String(value)
  return n.toFixed(2)
}

export function formatFreeDayRange(startDate: string, endDate: string | null): string {
  const start = startDate.includes('T') ? (startDate.split('T')[0] ?? startDate) : startDate.slice(0, 10)
  if (!endDate || endDate === startDate) {
    const [year, month, day] = start.split('-').map(Number)
    const d = new Date(year!, month! - 1, day!)
    return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })
  }
  const end = endDate.includes('T') ? (endDate.split('T')[0] ?? endDate) : endDate.slice(0, 10)
  const [sy, sm, sd] = start.split('-').map(Number)
  const [ey, em, ed] = end.split('-').map(Number)
  const from = new Date(sy!, sm! - 1, sd!)
  const to = new Date(ey!, em! - 1, ed!)
  return `${from.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} – ${to.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}`
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
