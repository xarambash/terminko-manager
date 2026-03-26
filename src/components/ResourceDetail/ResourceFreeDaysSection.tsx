import { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useCreateFreeDay, useResourceFreeDays } from '../../hooks'
import { extractServerError } from '../../lib/errors'
import { formatFreeDayDate } from '../../lib/resourceDetailUtils'

export function ResourceFreeDaysSection({ resourceId }: { resourceId: string }) {
  const { t } = useTranslation()
  const { data: rows, isPending, isError, error } = useResourceFreeDays(resourceId)
  const createMutation = useCreateFreeDay(resourceId)

  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState<string | undefined>()

  const onAdd = async () => {
    setFormError(undefined)
    createMutation.reset()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFormError(t('resourceDetail.freeDays.validationDate'))
      return
    }
    try {
      await createMutation.mutateAsync({
        date,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      })
      setReason('')
    } catch (err: unknown) {
      setFormError(extractServerError(err) ?? t('resourceDetail.freeDays.errorAdd'))
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
                  <DataTableTh variant="inset">{t('common.date')}</DataTableTh>
                  <DataTableTh variant="inset">{t('common.reason')}</DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {(rows ?? []).length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="inset" colSpan={2}>
                      {t('resourceDetail.freeDays.empty')}
                    </DataTableEmptyCell>
                  </tr>
                ) : (
                  (rows ?? []).map((f) => (
                    <DataTableBodyRow key={f.id}>
                      <DataTableTd variant="inset" className="text-[var(--text-h)]">
                        {formatFreeDayDate(f.date)}
                      </DataTableTd>
                      <DataTableTd variant="inset" className="text-[var(--text)]">
                        {f.reason ?? t('common.dash')}
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
              <FormField
                label={t('common.date')}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
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
    </Card>
  )
}
