import { useMemo, useState } from 'react'
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
import { useCreateWorkingHour, useResourceWorkingHours } from '../../hooks'
import { calendarLocaleFromLng } from '../../lib/dateLocale'
import { extractServerError } from '../../lib/errors'
import {
  formatWeekdayLong,
  inputSelectClass,
  parseTimeToMinutes,
  timeRe,
} from '../../lib/resourceDetailUtils'

const WEEKDAY_INDICES = [0, 1, 2, 3, 4, 5, 6] as const

export function ResourceWorkingHoursSection({ resourceId }: { resourceId: string }) {
  const { t, i18n } = useTranslation()
  const calLocale = calendarLocaleFromLng(i18n.language)
  const { data: rows, isPending, isError, error } = useResourceWorkingHours(resourceId)
  const createMutation = useCreateWorkingHour(resourceId)

  const [dayOfWeek, setDayOfWeek] = useState('1')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [formError, setFormError] = useState<string | undefined>()

  const resetMutationState = () => {
    setFormError(undefined)
    createMutation.reset()
  }

  const onAdd = async () => {
    resetMutationState()
    if (!timeRe.test(startTime) || !timeRe.test(endTime)) {
      setFormError(t('resourceDetail.workingHours.validationTime'))
      return
    }
    if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) {
      setFormError(t('resourceDetail.workingHours.validationOrder'))
      return
    }
    const day = Number.parseInt(dayOfWeek, 10)
    try {
      await createMutation.mutateAsync({
        dayOfWeek: day,
        startTime,
        endTime,
      })
    } catch (err: unknown) {
      setFormError(extractServerError(err) ?? t('resourceDetail.workingHours.errorAdd'))
    }
  }

  const sorted = useMemo(() => {
    const list = [...(rows ?? [])]
    list.sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek
      return a.startTime.localeCompare(b.startTime)
    })
    return list
  }, [rows])

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-6">
      <h2 className="text-lg font-medium text-[var(--text-h)]">{t('resourceDetail.workingHours.title')}</h2>
      <p className="text-sm text-[var(--text)]">{t('resourceDetail.workingHours.description')}</p>

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText={t('loading.workingHours')}
      />

      {!isPending && !isError && (
        <>
          <DataTableScroll variant="inset">
            <DataTable variant="inset" minWidth={400}>
              <thead>
                <DataTableHeadRow variant="inset">
                  <DataTableTh variant="inset">{t('common.day')}</DataTableTh>
                  <DataTableTh variant="inset">{t('common.start')}</DataTableTh>
                  <DataTableTh variant="inset">{t('common.end')}</DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="inset" colSpan={3}>
                      {t('resourceDetail.workingHours.empty')}
                    </DataTableEmptyCell>
                  </tr>
                ) : (
                  sorted.map((w) => (
                    <DataTableBodyRow key={w.id}>
                      <DataTableTd variant="inset" className="text-[var(--text-h)]">
                        {formatWeekdayLong(w.dayOfWeek, calLocale)}
                      </DataTableTd>
                      <DataTableTd variant="inset" className="text-[var(--text)]">
                        {w.startTime}
                      </DataTableTd>
                      <DataTableTd variant="inset" className="text-[var(--text)]">
                        {w.endTime}
                      </DataTableTd>
                    </DataTableBodyRow>
                  ))
                )}
              </tbody>
            </DataTable>
          </DataTableScroll>

          <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
            <p className="text-sm font-medium text-[var(--text-h)]">
              {t('resourceDetail.workingHours.addInterval')}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor="wh-day" className="mb-1 block text-sm text-[var(--text)]">
                  {t('common.day')}
                </label>
                <select
                  id="wh-day"
                  className={inputSelectClass}
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                >
                  {WEEKDAY_INDICES.map((i) => (
                    <option key={i} value={String(i)}>
                      {formatWeekdayLong(i, calLocale)}
                    </option>
                  ))}
                </select>
              </div>
              <FormField
                label={t('resourceDetail.workingHours.startLabel')}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:00"
              />
              <FormField
                label={t('resourceDetail.workingHours.endLabel')}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="17:00"
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
