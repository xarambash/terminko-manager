import { useMemo, useState } from 'react'
import { parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { IconTrash } from '@tabler/icons-react'
import {
  Paper, Stack, Text, Button, Group, Modal, TextInput, ActionIcon, Tooltip,
} from '@mantine/core'
import { DateRangePicker } from '../ui/DateRangePicker'
import type { DateRangeValue } from '../ui/DateRangePicker'
import {
  DataTable, DataTableBodyRow, DataTableEmptyCell, DataTableHeadRow,
  DataTableScroll, DataTableTd, DataTableTh,
} from '../ui/DataTable'
import { FormError } from '../ui/FormError'
import { QueryStatusBanner } from '../ui/QueryStatusBanner'
import { useCreateFreeDay, useDeleteFreeDay, useResourceFreeDays } from '../../hooks'
import { extractServerError } from '../../lib/errors'
import { formatFreeDayRange } from '../../lib/resourceDetailUtils'
import type { ResourceFreeDay } from '../../types'

const emptyRange: DateRangeValue = { from: '', to: undefined }

function rangesOverlap(from: string, to: string | undefined, rows: ResourceFreeDay[]): boolean {
  const fromDate = parseISO(from)
  const toDate = to ? parseISO(to) : fromDate
  return rows.some((row) => {
    const rowFrom = parseISO(row.start_date)
    const rowTo = row.end_date ? parseISO(row.end_date) : rowFrom
    return fromDate <= rowTo && toDate >= rowFrom
  })
}

export function ResourceFreeDaysSection({ resourceId }: { resourceId: string }) {
  const { t } = useTranslation()
  const { data: rows, isPending, isError, error } = useResourceFreeDays(resourceId)
  const createMutation = useCreateFreeDay(resourceId)
  const deleteMutation = useDeleteFreeDay(resourceId)

  const [range, setRange] = useState<DateRangeValue>(emptyRange)
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState<string | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<ResourceFreeDay | null>(null)
  const [deleteError, setDeleteError] = useState<string | undefined>()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])

  const existingRanges = (rows ?? []).map((row) => ({
    from: parseISO(row.start_date),
    to: row.end_date ? parseISO(row.end_date) : parseISO(row.start_date),
  }))

  const onAdd = async () => {
    setFormError(undefined)
    createMutation.reset()
    if (!range.from) { setFormError(t('resourceDetail.freeDays.validationStartDate')); return }
    if (range.to && range.to < range.from) { setFormError(t('resourceDetail.freeDays.validationDateOrder')); return }
    if (rangesOverlap(range.from, range.to, rows ?? [])) { setFormError(t('resourceDetail.freeDays.errorOverlap')); return }
    try {
      await createMutation.mutateAsync({
        start_date: range.from,
        ...(range.to && range.to !== range.from ? { end_date: range.to } : {}),
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      })
      setRange(emptyRange)
      setReason('')
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setFormError(t('resourceDetail.freeDays.errorOverlap'))
      } else {
        setFormError(extractServerError(err) ?? t('resourceDetail.freeDays.errorAdd'))
      }
    }
  }

  const onDelete = async () => {
    if (!deleteTarget) return
    deleteMutation.reset()
    setDeleteError(undefined)
    try {
      await deleteMutation.mutateAsync(deleteTarget.id)
      setDeleteTarget(null)
    } catch (err: unknown) {
      setDeleteError(extractServerError(err) ?? t('resourceDetail.freeDays.errorDelete'))
    }
  }

  return (
    <Paper withBorder shadow="xs" p="md">
      <Stack gap="md">
        <div>
          <Text fw={500} size="md" mb="xs">{t('resourceDetail.freeDays.title')}</Text>
          <Text size="sm" c="dimmed">{t('resourceDetail.freeDays.description')}</Text>
        </div>

        <QueryStatusBanner isPending={isPending} isError={isError} error={error} loadingText={t('loading.freeDays')} />

        {!isPending && !isError && (
          <>
            <DataTableScroll variant="inset">
              <DataTable variant="inset" minWidth={260}>
                <thead>
                  <DataTableHeadRow variant="inset">
                    <DataTableTh variant="inset">{t('resourceDetail.freeDays.dateRange')}</DataTableTh>
                    <DataTableTh variant="inset">{t('common.reason')}</DataTableTh>
                    <DataTableTh variant="inset" style={{ width: 48 }} />
                  </DataTableHeadRow>
                </thead>
                <tbody>
                  {(rows ?? []).length === 0 ? (
                    <tr><DataTableEmptyCell variant="inset" colSpan={3}>{t('resourceDetail.freeDays.empty')}</DataTableEmptyCell></tr>
                  ) : (
                    (rows ?? []).map((f) => (
                      <DataTableBodyRow
                        key={f.id}
                        hoverable
                        onMouseEnter={() => setHoveredId(f.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        <DataTableTd variant="inset">{formatFreeDayRange(f.start_date, f.end_date)}</DataTableTd>
                        <DataTableTd variant="inset">{f.reason ?? t('common.dash')}</DataTableTd>
                        <DataTableTd variant="inset" align="right" style={{ width: 52 }}>
                          <div style={{ visibility: hoveredId === f.id ? 'visible' : 'hidden' }}>
                            <Tooltip label={t('resourceDetail.freeDays.deleteTitle')} withArrow>
                              <ActionIcon
                                variant="outline"
                                color="red"
                                size="md"
                                aria-label={t('resourceDetail.freeDays.deleteAriaLabel')}
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(f) }}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </div>
                        </DataTableTd>
                      </DataTableBodyRow>
                    ))
                  )}
                </tbody>
              </DataTable>
            </DataTableScroll>

            <Stack gap="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
              <Text size="sm" fw={500}>{t('resourceDetail.freeDays.addTitle')}</Text>
              <Group align="flex-end" gap="sm" wrap="wrap">
                <Stack gap="xs">
                  <Text size="sm" fw={500}>{t('resourceDetail.freeDays.dateRangeLabel')}</Text>
                  <DateRangePicker
                    value={range}
                    onChange={setRange}
                    placeholder={t('resourceDetail.freeDays.dateRangePlaceholder')}
                    disabledRanges={existingRanges}
                    minDate={today}
                  />
                </Stack>
                <TextInput
                  label={t('resourceDetail.freeDays.reasonOptional')}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('resourceDetail.freeDays.reasonPlaceholder')}
                  miw={200}
                />
                <Button
                  disabled={createMutation.isPending}
                  loading={createMutation.isPending}
                  onClick={() => void onAdd()}
                  mb={1}
                >
                  {t('common.add')}
                </Button>
              </Group>
              <FormError message={formError} />
            </Stack>
          </>
        )}
      </Stack>

      <Modal
        opened={deleteTarget != null}
        onClose={() => { setDeleteTarget(null); setDeleteError(undefined) }}
        title={t('resourceDetail.freeDays.deleteTitle')}
        size="sm"
      >
        <Stack gap="sm">
          <Text size="sm">
            {deleteTarget ? t('resourceDetail.freeDays.deleteBody', { dateRange: formatFreeDayRange(deleteTarget.start_date, deleteTarget.end_date) }) : null}
          </Text>
          <FormError message={deleteError} />
          <Group justify="flex-end" gap="sm">
            <Button variant="default" disabled={deleteMutation.isPending} onClick={() => { setDeleteTarget(null); setDeleteError(undefined) }}>
              {t('common.cancel')}
            </Button>
            <Button color="red" loading={deleteMutation.isPending} onClick={() => void onDelete()}>
              {t('resourceDetail.freeDays.deleteConfirm')}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  )
}
