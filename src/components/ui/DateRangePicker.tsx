import { DatePickerInput } from '@mantine/dates'
import type { DayOfWeek } from '@mantine/dates'
import { useTranslation } from 'react-i18next'
import { calendarLocaleFromLng } from '../../lib/dateLocale'

export interface DateRangeValue {
  from: string
  to?: string
}

interface DateRangePickerProps {
  value: DateRangeValue
  onChange: (value: DateRangeValue) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  disabledRanges?: { from: Date; to: Date }[]
  minDate?: Date
}

function toLocalDate(v: string): Date {
  return new Date(`${v}T00:00:00`)
}

function formatDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(`${d}T00:00:00`)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Select date range',
  className,
  disabled,
  disabledRanges = [],
  minDate,
}: DateRangePickerProps) {
  const { i18n } = useTranslation()
  const locale = calendarLocaleFromLng(i18n.language)

  const fromDate = value.from ? toLocalDate(value.from) : null
  const toDate = value.to ? toLocalDate(value.to) : null
  const rangeValue: [Date | null, Date | null] = [fromDate, toDate]

  const isDateDisabled = (date: unknown) => {
    const d = date instanceof Date ? date : new Date(`${date}T00:00:00`)
    return disabledRanges.some((r) => d >= r.from && d <= r.to)
  }

  const getDayProps = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(`${date}T00:00:00`)
    const isPast = minDate != null && d < minDate
    const isExcluded = isDateDisabled(date)
    if (isPast || isExcluded) {
      return { style: { textDecoration: 'line-through' as const } }
    }
    return {}
  }

  return (
    <DatePickerInput
      type="range"
      value={rangeValue}
      onChange={(range) => {
        const [from, to] = range as [Date | string | null, Date | string | null]
        if (!from) {
          onChange({ from: '', to: undefined })
          return
        }
        onChange({ from: formatDate(from), to: to ? formatDate(to) : undefined })
      }}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      locale={locale}
      firstDayOfWeek={1 as DayOfWeek}
      valueFormat="MMM D"
      minDate={minDate}
      excludeDate={isDateDisabled as unknown as (date: string) => boolean}
      getDayProps={getDayProps as any}
      clearable
      miw={200}
    />
  )
}
