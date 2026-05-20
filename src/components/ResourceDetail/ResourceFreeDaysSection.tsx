import { useState } from 'react'
import { parseISO } from 'date-fns'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { Trash2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { DateRangePicker } from '../ui/DateRangePicker'
import type { DateRangeValue } from '../ui/DateRangePicker'
import {
  DataTable,
  DataTableBodyRow,
  DataTableEmptyCell,
  DataTableHeadRow,
  DataTableScroll,
  DataTableTd,
  DataTableTh,
} from '../ui/DataTable'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { FormError } from '../ui/FormError'
import { FormField } from '../ui/FormField'
import { QueryStatusBanner } from '../ui/QueryStatusBanner'
import { useCreateFreeDay, useDeleteFreeDay, useResourceFreeDays } from '../../hooks'
import { extractServerError } from '../../lib/errors'
import { formatFreeDayRange } from '../../lib/resourceDetailUtils'
import type { ResourceFreeDay } from '../../types'

const emptyRange: DateRangeValue = { from: '', to: undefined }

function rangesOverlap(
  from: string,
  to: string | undefined,
  rows: ResourceFreeDay[],
): boolean {
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

  const existingRanges = (rows ?? []).map((row) => ({
    from: parseISO(row.start_date),
    to: row.end_date ? parseISO(row.end_date) : parseISO(row.start_date),
  }))

  const onAdd = async () => {
    setFormError(undefined)
    createMutation.reset()

    if (!range.from) {
      setFormError(t('resourceDetail.freeDays.validationStartDate'))
      return
    }
    if (range.to && range.to < range.from) {
      setFormError(t('resourceDetail.freeDays.validationDateOrder'))
      return
    }
    if (rangesOverlap(range.from, range.to, rows ?? [])) {
      setFormError(t('resourceDetail.freeDays.errorOverlap'))
      return
    }

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
    <Card className="flex flex-col gap-4 p-4 sm:p-6">
      <h2 className="text-lg font-medium text-[var(--text-h)]">{t('resourceDetail.freeDays.title')}</h2>
      <p className="text-sm text-[var(--text)]">{t('resourceDetail.freeDays.description')}</p>

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText={t('loading.freeDays')}
      />

      {!isPending && !isError && (
        <>
          <DataTableScroll variant="inset">
            <DataTable variant="inset" minWidth={360}>
              <thead>
                <DataTableHeadRow variant="inset">
                  <DataTableTh variant="inset">{t('resourceDetail.freeDays.dateRange')}</DataTableTh>
                  <DataTableTh variant="inset">{t('common.reason')}</DataTableTh>
                  <DataTableTh variant="inset" className="w-12" />
                </DataTableHeadRow>
              </thead>
              <tbody>
                {(rows ?? []).length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="inset" colSpan={3}>
                      {t('resourceDetail.freeDays.empty')}
                    </DataTableEmptyCell>
                  </tr>
                ) : (
                  (rows ?? []).map((f) => (
                    <DataTableBodyRow key={f.id}>
                      <DataTableTd variant="inset" className="text-[var(--text-h)]">
                        {formatFreeDayRange(f.start_date, f.end_date)}
                      </DataTableTd>
                      <DataTableTd variant="inset" className="text-[var(--text)]">
                        {f.reason ?? t('common.dash')}
                      </DataTableTd>
                      <DataTableTd variant="inset">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('resourceDetail.freeDays.deleteAriaLabel')}
                          onClick={(e) => {
                            e.stopPropagation()
                            setDeleteTarget(f)
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </DataTableTd>
                    </DataTableBodyRow>
                  ))
                )}
              </tbody>
            </DataTable>
          </DataTableScroll>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-medium text-[var(--text-h)]">
              {t('resourceDetail.freeDays.addTitle')}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-foreground">
                  {t('resourceDetail.freeDays.dateRangeLabel')}
                </span>
                <DateRangePicker
                  value={range}
                  onChange={setRange}
                  placeholder={t('resourceDetail.freeDays.dateRangePlaceholder')}
                  disabledRanges={existingRanges}
                  className="w-full"
                />
              </div>
              <FormField
                label={t('resourceDetail.freeDays.reasonOptional')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('resourceDetail.freeDays.reasonPlaceholder')}
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  disabled={createMutation.isPending}
                  onClick={() => void onAdd()}
                >
                  {createMutation.isPending ? t('common.adding') : t('common.add')}
                </Button>
              </div>
            </div>
            <FormError message={formError} />
          </div>
        </>
      )}

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
            <DialogTitle>{t('resourceDetail.freeDays.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? t('resourceDetail.freeDays.deleteBody', {
                    dateRange: formatFreeDayRange(deleteTarget.start_date, deleteTarget.end_date),
                  })
                : null}
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
              {deleteMutation.isPending
                ? t('resourceDetail.freeDays.deleting')
                : t('resourceDetail.freeDays.deleteConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
