import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActionIcon, Alert, Box, Divider, Group, Loader, Paper, Stack, Text } from '@mantine/core'
import { IconAlertCircle, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Card } from './ui/Card'
import { DropdownPicker } from './ui/DropdownPicker'
import { calendarLocaleFromLng } from '../lib/dateLocale'
import { formatQueryError } from '../lib/errors'
import type { AppointmentWithRelations } from '../types'

const MIN_CARD_HEIGHT = 72
const PX_PER_MINUTE = 2

type DropdownOption = { value: string; label: string }

type AppointmentsTimelineProps = {
  appointments: AppointmentWithRelations[]
  isPending: boolean
  isError: boolean
  error: Error | null
  isOwner: boolean
  resourceOptions: DropdownOption[]
  selectedResourceId: string
  onResourceChange: (id: string) => void
  selectedDate: string
  onDateChange: (date: string) => void
}

type AppointmentItem = { type: 'appointment'; apt: AppointmentWithRelations }
type FreeSlotItem = { type: 'free'; startAt: string; minutes: number }
type TimelineItem = AppointmentItem | FreeSlotItem

function toDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function shiftDate(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + delta)
  return toDateStr(date)
}

function formatDateLabel(dateStr: string, locale: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(isoStr: string, locale: string): string {
  return new Date(isoStr).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

function statusBorderColor(status: string): string {
  if (status === 'scheduled') return 'var(--mantine-color-green-6)'
  if (status === 'completed') return 'var(--mantine-color-blue-6)'
  return 'var(--mantine-color-gray-5)'
}

export function AppointmentsTimeline({
  appointments,
  isPending,
  isError,
  error,
  isOwner,
  resourceOptions,
  selectedResourceId,
  onResourceChange,
  selectedDate,
  onDateChange,
}: AppointmentsTimelineProps) {
  const { t, i18n } = useTranslation()
  const locale = calendarLocaleFromLng(i18n.language)

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => a.startAt.localeCompare(b.startAt)),
    [appointments]
  )

  const timelineItems = useMemo((): TimelineItem[] => {
    const items: TimelineItem[] = []
    sorted.forEach((apt, i) => {
      items.push({ type: 'appointment', apt })
      if (i < sorted.length - 1) {
        const gapMins = Math.round(
          (new Date(sorted[i + 1].startAt).getTime() - new Date(sorted[i].endAt).getTime()) / 60000
        )
        if (gapMins > 0) {
          items.push({ type: 'free', startAt: sorted[i].endAt, minutes: gapMins })
        }
      }
    })
    return items
  }, [sorted])

  return (
    <Card style={{ overflow: 'hidden' }}>
      <Group justify="space-between" align="center" p="sm">
        <ActionIcon
          variant="subtle"
          aria-label={t('appointments.timeline.prevDay')}
          onClick={() => onDateChange(shiftDate(selectedDate, -1))}
        >
          <IconChevronLeft size={18} />
        </ActionIcon>
        <Text fw={600} size="sm" ta="center" style={{ flex: 1, textTransform: 'capitalize' }}>
          {formatDateLabel(selectedDate, locale)}
        </Text>
        <ActionIcon
          variant="subtle"
          aria-label={t('appointments.timeline.nextDay')}
          onClick={() => onDateChange(shiftDate(selectedDate, 1))}
        >
          <IconChevronRight size={18} />
        </ActionIcon>
      </Group>

      {isOwner && (
        <Box px="sm" pb="sm">
          <DropdownPicker
            value={selectedResourceId}
            onValueChange={onResourceChange}
            options={resourceOptions}
            ariaLabel={t('appointments.filters.resource')}
            placeholder={t('appointments.filters.resource')}
          />
        </Box>
      )}

      <Divider />

      {isPending ? (
        <Group justify="center" p="xl">
          <Loader size="sm" />
        </Group>
      ) : isError ? (
        <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" m="sm">
          {formatQueryError(error)}
        </Alert>
      ) : sorted.length === 0 ? (
        <Text c="dimmed" ta="center" p="xl" size="sm">
          {isOwner ? t('appointments.emptyForDateAndResource') : t('appointments.emptyForDate')}
        </Text>
      ) : (
        <Stack gap={0} p="sm">
          {timelineItems.map((item, idx) => {
            if (item.type === 'free') {
              return (
                <Group key={`free-${idx}`} gap="xs" align="center" py="xs">
                  <Text size="xs" c="dimmed" w={44} ta="right">
                    {formatTime(item.startAt, locale)}
                  </Text>
                  <Divider
                    style={{ flex: 1 }}
                    label={t('appointments.timeline.freeSlot', { count: item.minutes })}
                    labelPosition="center"
                  />
                </Group>
              )
            }

            const { apt } = item
            const cardHeight = Math.max(MIN_CARD_HEIGHT, apt.service.durationMinutes * PX_PER_MINUTE)

            return (
              <Group key={apt.id} align="flex-start" gap="xs" mb="xs">
                <Stack w={44} h={cardHeight} justify="space-between" gap={0}>
                  <Text size="xs" fw={500} lh={1}>
                    {formatTime(apt.startAt, locale)}
                  </Text>
                  <Text size="xs" c="dimmed" lh={1}>
                    {formatTime(apt.endAt, locale)}
                  </Text>
                </Stack>
                <Paper
                  withBorder
                  radius="sm"
                  p="xs"
                  mih={cardHeight}
                  style={{ flex: 1, borderLeft: `3px solid ${statusBorderColor(apt.status)}` }}
                >
                  <Stack gap={4}>
                    <Text fw={600} size="sm" lh={1.3}>
                      {apt.guest.name}
                    </Text>
                    <Text size="sm" c="dimmed" lh={1.2}>
                      {apt.service.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t('common.minutes', { count: apt.service.durationMinutes })}
                    </Text>
                  </Stack>
                </Paper>
              </Group>
            )
          })}
        </Stack>
      )}
    </Card>
  )
}
