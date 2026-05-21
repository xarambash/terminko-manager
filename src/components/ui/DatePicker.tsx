import { DatePickerInput } from '@mantine/dates'
import type { DayOfWeek } from '@mantine/dates'
import { useTranslation } from 'react-i18next'
import { calendarLocaleFromLng } from '../../lib/dateLocale'
import { IconCalendar } from '@tabler/icons-react'

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  'aria-label'?: string
}

function toLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`)
}

function formatDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(`${d}T00:00:00`)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  className,
  disabled,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  const { i18n } = useTranslation()
  const locale = calendarLocaleFromLng(i18n.language)
  const dateValue = value ? toLocalDate(value) : null

  return (
    <DatePickerInput
      value={dateValue}
      onChange={(date) => {
        if (!date) return
        onChange(formatDate(date as Date | string))
      }}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      locale={locale}
      firstDayOfWeek={1 as DayOfWeek}
      valueFormat="MMM D, YYYY"
      clearable={false}
      miw={160}
      rightSection={<IconCalendar />}
      rightSectionPointerEvents="none"
    />
  )
}
