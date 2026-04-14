import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import {
  DataTable,
  DataTableBodyRow,
  DataTableEmptyCell,
  DataTableHeadRow,
  DataTableScroll,
  DataTableTd,
  DataTableTh,
} from '../ui/DataTable'
import { FormError } from '../ui/FormError'
import { FormField } from '../ui/FormField'
import { QueryStatusBanner } from '../ui/QueryStatusBanner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import {
  useCreateWorkingHour,
  useDeleteWorkingHour,
  useResourceWorkingHours,
  useUpdateWorkingHour,
} from '../../hooks'
import { calendarLocaleFromLng } from '../../lib/dateLocale'
import { extractServerError } from '../../lib/errors'
import {
  formatWeekdayLong,
  parseTimeToMinutes,
  timeRe,
} from '../../lib/resourceDetailUtils'
import type { ResourceWorkingHour } from '../../types'

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

type IntervalModalState = {
  mode: 'add' | 'edit'
  dayOfWeek: number
  startTime: string
  endTime: string
  intervalId?: string
  error?: string
}

function createEmptyWeek(): Record<number, ResourceWorkingHour[]> {
  return { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
}

function hasOverlaps(
  intervals: ResourceWorkingHour[],
  candidate: { startTime: string; endTime: string },
  ignoreId?: string
): boolean {
  const nextStart = parseTimeToMinutes(candidate.startTime)
  const nextEnd = parseTimeToMinutes(candidate.endTime)

  return intervals
    .filter((row) => row.id !== ignoreId)
    .some((row) => {
      const start = parseTimeToMinutes(row.startTime)
      const end = parseTimeToMinutes(row.endTime)
      return nextStart < end && start < nextEnd
    })
}

export function ResourceWorkingHoursSection({ resourceId }: { resourceId: string }) {
  const { t, i18n } = useTranslation()
  const calLocale = calendarLocaleFromLng(i18n.language)
  const { data: rows, isPending, isError, error } = useResourceWorkingHours(resourceId)
  const createMutation = useCreateWorkingHour(resourceId)
  const updateMutation = useUpdateWorkingHour(resourceId)
  const deleteMutation = useDeleteWorkingHour(resourceId)
  const [intervalModal, setIntervalModal] = useState<IntervalModalState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ResourceWorkingHour | null>(null)
  const [deleteError, setDeleteError] = useState<string | undefined>()

  const sorted = useMemo(() => {
    const list = [...(rows ?? [])]
    list.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
      return a.startTime.localeCompare(b.startTime)
    })
    return list
  }, [rows])

  const groupedByDay = useMemo(() => {
    const nextRows = createEmptyWeek()
    for (const row of sorted) {
      nextRows[row.dayOfWeek]?.push({
        ...row,
      })
    }
    return nextRows
  }, [sorted])

  const closeIntervalModal = () => {
    createMutation.reset()
    updateMutation.reset()
    setIntervalModal(null)
  }

  const openAddModal = (dayOfWeek: number) => {
    setIntervalModal({
      mode: 'add',
      dayOfWeek,
      startTime: '09:00',
      endTime: '17:00',
    })
  }

  const openEditModal = (row: ResourceWorkingHour) => {
    setIntervalModal({
      mode: 'edit',
      intervalId: row.id,
      dayOfWeek: row.dayOfWeek,
      startTime: row.startTime,
      endTime: row.endTime,
    })
  }

  const extractIntervalError = (err: unknown, fallback: string) => {
    if (isAxiosError(err) && err.response?.status === 409) {
      return t('resourceDetail.workingHours.overlapConflict')
    }
    return extractServerError(err) ?? fallback
  }

  const validateModal = (state: IntervalModalState): string | undefined => {
    if (!timeRe.test(state.startTime) || !timeRe.test(state.endTime)) {
      return t('resourceDetail.workingHours.validationTime')
    }
    if (parseTimeToMinutes(state.endTime) <= parseTimeToMinutes(state.startTime)) {
      return t('resourceDetail.workingHours.validationOrder')
    }
    const dayIntervals = groupedByDay[state.dayOfWeek] ?? []
    if (
      hasOverlaps(
        dayIntervals,
        { startTime: state.startTime, endTime: state.endTime },
        state.intervalId
      )
    ) {
      return t('resourceDetail.workingHours.validationOverlap')
    }
    return undefined
  }

  const onSubmitIntervalModal = async () => {
    if (!intervalModal) return
    createMutation.reset()
    updateMutation.reset()

    const validationError = validateModal(intervalModal)
    if (validationError) {
      setIntervalModal((prev) => (prev ? { ...prev, error: validationError } : prev))
      return
    }

    try {
      if (intervalModal.mode === 'add') {
        await createMutation.mutateAsync({
          dayOfWeek: intervalModal.dayOfWeek,
          startTime: intervalModal.startTime,
          endTime: intervalModal.endTime,
        })
        closeIntervalModal()
        return
      }

      await updateMutation.mutateAsync({
        workingHourId: intervalModal.intervalId!,
        body: { dayOfWeek: intervalModal.dayOfWeek, startTime: intervalModal.startTime, endTime: intervalModal.endTime },
      })
      closeIntervalModal()
    } catch (err: unknown) {
      const message = extractIntervalError(err, t('resourceDetail.workingHours.errorSave'))
      setIntervalModal((prev) => (prev ? { ...prev, error: message } : prev))
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
      const message = extractIntervalError(err, t('resourceDetail.workingHours.errorDelete'))
      setDeleteError(message)
    }
  }

  const submitPending = createMutation.isPending || updateMutation.isPending

  const modalTitle =
    intervalModal?.mode === 'edit'
      ? t('resourceDetail.workingHours.modalEditTitle')
      : t('resourceDetail.workingHours.modalAddTitle')

  const modalSubmitText =
    intervalModal?.mode === 'edit'
      ? t('resourceDetail.workingHours.modalUpdate')
      : t('resourceDetail.workingHours.modalAdd')

  return (
    <Card className="flex flex-col gap-4 pr-4 sm:pl-6">
      <h2 className="text-lg font-medium text-[var(--text-h)]">{t('resourceDetail.workingHours.title')}</h2>
      <p className="text-sm text-[var(--text)]">{t('resourceDetail.workingHours.description')}</p>

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText={t('loading.workingHours')}
      />

      {!isPending && !isError && (
        <div className="flex flex-col gap-4">
          {WEEKDAY_ORDER.map((dayOfWeek) => {
            const intervals = groupedByDay[dayOfWeek] ?? []
            return (
              <div key={dayOfWeek}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-[var(--text-h)]">
                    {formatWeekdayLong(dayOfWeek, calLocale)}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openAddModal(dayOfWeek)}
                  >
                    {t('resourceDetail.workingHours.addInterval')}
                  </Button>
                </div>

                <DataTableScroll variant="inset">
                  <DataTable variant="inset" minWidth={560}>
                    <thead>
                      <DataTableHeadRow variant="inset">
                        <DataTableTh variant="inset">{t('common.start')}</DataTableTh>
                        <DataTableTh variant="inset">{t('common.end')}</DataTableTh>
                        <DataTableTh variant="inset" align="right">
                          {t('common.actions')}
                        </DataTableTh>
                      </DataTableHeadRow>
                    </thead>
                    <tbody>
                      {intervals.length === 0 ? (
                        <tr>
                          <DataTableEmptyCell variant="inset" colSpan={3}>
                            {t('resourceDetail.workingHours.emptyDay')}
                          </DataTableEmptyCell>
                        </tr>
                      ) : (
                        intervals.map((row) => (
                          <DataTableBodyRow key={row.id}>
                            <DataTableTd variant="inset" className="text-[var(--text)]">
                              {row.startTime}
                            </DataTableTd>
                            <DataTableTd variant="inset" className="text-[var(--text)]">
                              {row.endTime}
                            </DataTableTd>
                            <DataTableTd variant="inset" align="right">
                              <div className="flex justify-end gap-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon-sm"
                                  aria-label={t('services.edit')}
                                  title={t('services.edit')}
                                  onClick={() => openEditModal(row)}
                                >
                                  <Pencil aria-hidden />
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon-sm"
                                  aria-label={t('services.delete')}
                                  title={t('services.delete')}
                                  onClick={() => {
                                    setDeleteError(undefined)
                                    setDeleteTarget(row)
                                  }}
                                >
                                  <Trash2 aria-hidden />
                                </Button>
                              </div>
                            </DataTableTd>
                          </DataTableBodyRow>
                        ))
                      )}
                    </tbody>
                  </DataTable>
                </DataTableScroll>
              </div>
            )
          })}
        </div>
      )}

      <Dialog
        open={intervalModal != null}
        onOpenChange={(next) => {
          if (!next) closeIntervalModal()
        }}
      >
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
            <DialogDescription>
              {intervalModal
                ? formatWeekdayLong(intervalModal.dayOfWeek, calLocale)
                : t('common.dash')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <FormField
              label={t('resourceDetail.workingHours.startLabel')}
              type="time"
              value={intervalModal?.startTime ?? ''}
              onChange={(e) =>
                setIntervalModal((prev) =>
                  prev ? { ...prev, startTime: e.target.value, error: undefined } : prev
                )
              }
            />
            <FormField
              label={t('resourceDetail.workingHours.endLabel')}
              type="time"
              value={intervalModal?.endTime ?? ''}
              onChange={(e) =>
                setIntervalModal((prev) =>
                  prev ? { ...prev, endTime: e.target.value, error: undefined } : prev
                )
              }
            />
            <FormError message={intervalModal?.error} />
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeIntervalModal} disabled={submitPending}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={() => void onSubmitIntervalModal()} disabled={submitPending}>
              {submitPending ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  {modalSubmitText}
                </span>
              ) : (
                modalSubmitText
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteTarget != null}
        onOpenChange={(next) => {
          if (!next) {
            setDeleteTarget(null)
            setDeleteError(undefined)
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('resourceDetail.workingHours.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('resourceDetail.workingHours.deleteBody', {
                startTime: deleteTarget?.startTime ?? '',
                endTime: deleteTarget?.endTime ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          <FormError message={deleteError} />
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={deleteMutation.isPending}
              onClick={() => {
                setDeleteTarget(null)
                setDeleteError(undefined)
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => void onDelete()}
            >
              {deleteMutation.isPending ? t('resourceDetail.workingHours.deleting') : t('resourceDetail.workingHours.deleteConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
