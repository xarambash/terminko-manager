import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
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
          <div className="overflow-x-auto rounded border border-[var(--border)]">
            <table className="w-full min-w-[360px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--code-bg)]">
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-h)]">
                    {t('common.date')}
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-h)]">
                    {t('common.reason')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-3 py-6 text-center text-[var(--text)]">
                      {t('resourceDetail.freeDays.empty')}
                    </td>
                  </tr>
                ) : (
                  (rows ?? []).map((f) => (
                    <tr key={f.id} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="px-3 py-2 text-[var(--text-h)]">{formatFreeDayDate(f.date)}</td>
                      <td className="px-3 py-2 text-[var(--text)]">{f.reason ?? t('common.dash')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
