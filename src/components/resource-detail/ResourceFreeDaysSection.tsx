import { useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FormError } from '../ui/FormError'
import { FormField } from '../ui/FormField'
import { QueryStatusBanner } from '../ui/QueryStatusBanner'
import { useCreateFreeDay, useResourceFreeDays } from '../../hooks'
import { extractServerError } from '../../lib/errors'
import { formatFreeDayDate } from './resourceDetailUtils'

export function ResourceFreeDaysSection({ resourceId }: { resourceId: string }) {
  const { data: rows, isPending, isError, error } = useResourceFreeDays(resourceId)
  const createMutation = useCreateFreeDay(resourceId)

  const [date, setDate] = useState('')
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState<string | undefined>()

  const onAdd = async () => {
    setFormError(undefined)
    createMutation.reset()
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setFormError('Use YYYY-MM-DD for the date')
      return
    }
    try {
      await createMutation.mutateAsync({
        date,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      })
      setReason('')
    } catch (err: unknown) {
      setFormError(extractServerError(err) ?? 'Could not add free day')
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium text-[var(--text-h)]">Free days</h2>
      <p className="text-sm text-[var(--text)]">
        Days when this resource is not available for booking.
      </p>

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText="Loading free days…"
      />

      {!isPending && !isError && (
        <>
          <div className="overflow-x-auto rounded border border-[var(--border)]">
            <table className="w-full min-w-[360px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--code-bg)]">
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-h)]">Date</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-h)]">Reason</th>
                </tr>
              </thead>
              <tbody>
                {(rows ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-3 py-6 text-center text-[var(--text)]">
                      No free days yet.
                    </td>
                  </tr>
                ) : (
                  (rows ?? []).map((f) => (
                    <tr key={f.id} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="px-3 py-2 text-[var(--text-h)]">{formatFreeDayDate(f.date)}</td>
                      <td className="px-3 py-2 text-[var(--text)]">{f.reason ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-medium text-[var(--text-h)]">Add free day</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <FormField
                label="Reason (optional)"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Holiday"
              />
              <div className="flex items-end">
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  disabled={createMutation.isPending}
                  onClick={() => void onAdd()}
                >
                  {createMutation.isPending ? 'Adding…' : 'Add'}
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
