import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { isAxiosError } from 'axios'
import { Copy, Plus, X } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FormError } from '../ui/FormError'
import { Input } from '../ui/input'
import { QueryStatusBanner } from '../ui/QueryStatusBanner'
import { Switch } from '../ui/Switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { useResourceWorkingHours } from '../../hooks'
import { useAuth } from '../../hooks'
import { calendarLocaleFromLng } from '../../lib/dateLocale'
import { extractServerError } from '../../lib/errors'
import {
  formatWeekdayLong,
  parseTimeToMinutes,
  timeRe,
} from '../../lib/resourceDetailUtils'
import {
  createResourceWorkingHour,
  deleteResourceWorkingHour,
  updateResourceWorkingHour,
} from '../../api/resourceScheduling'
import type { ResourceWorkingHour } from '../../types'

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

type DraftInterval = {
  tempId: string
  id?: string
  startTime: string
  endTime: string
}

type DayState = {
  active: boolean
  intervals: DraftInterval[]
  intervalErrors: Record<string, string>
  dayError?: string
  saving: boolean
}

type WeekState = Record<number, DayState>

let _tid = 0
function newTempId(): string {
  return `t${++_tid}`
}

function emptyDay(): DayState {
  return { active: false, intervals: [], intervalErrors: {}, dayError: undefined, saving: false }
}

function buildDayState(dayOfWeek: number, rows: ResourceWorkingHour[]): DayState {
  const dayRows = rows
    .filter((r) => r.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  return {
    active: dayRows.length > 0,
    intervals: dayRows.map((r) => ({
      tempId: r.id,
      id: r.id,
      startTime: r.startTime,
      endTime: r.endTime,
    })),
    intervalErrors: {},
    dayError: undefined,
    saving: false,
  }
}

function buildWeekState(rows: ResourceWorkingHour[]): WeekState {
  const state: WeekState = {}
  for (const d of WEEKDAY_ORDER) state[d] = buildDayState(d, rows)
  return state
}

function hasIntervalOverlap(intervals: DraftInterval[]): boolean {
  for (let i = 0; i < intervals.length; i++) {
    for (let j = i + 1; j < intervals.length; j++) {
      const a = intervals[i]!
      const b = intervals[j]!
      if (
        parseTimeToMinutes(a.startTime) < parseTimeToMinutes(b.endTime) &&
        parseTimeToMinutes(b.startTime) < parseTimeToMinutes(a.endTime)
      )
        return true
    }
  }
  return false
}

function isDayDirty(day: DayState, serverRows: ResourceWorkingHour[], dayOfWeek: number): boolean {
  const srv = serverRows.filter((r) => r.dayOfWeek === dayOfWeek)
  const serverActive = srv.length > 0
  if (day.active !== serverActive) return true
  if (!day.active) return false
  if (day.intervals.length !== srv.length) return true
  for (const li of day.intervals) {
    if (!li.id) return true
    const si = srv.find((r) => r.id === li.id)
    if (!si || li.startTime !== si.startTime || li.endTime !== si.endTime) return true
  }
  return false
}

type ToggleOffState = { dayOfWeek: number; deleting: boolean; error?: string } | null

export function ResourceWorkingHoursSection({ resourceId }: { resourceId: string }) {
  const { t, i18n } = useTranslation()
  const calLocale = calendarLocaleFromLng(i18n.language)
  const { user } = useAuth()
  const tenantId = user?.tenantId
  const queryClient = useQueryClient()

  const { data: rows, isPending, isError, error } = useResourceWorkingHours(resourceId)

  const [localDays, setLocalDays] = useState<WeekState>(() => {
    const s: WeekState = {}
    for (const d of WEEKDAY_ORDER) s[d] = emptyDay()
    return s
  })
  const [toggleOff, setToggleOff] = useState<ToggleOffState>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (!rows || initialized.current) return
    initialized.current = true
    setLocalDays(buildWeekState(rows))
  }, [rows])

  const workingHoursKey = ['resourceWorkingHours', tenantId, resourceId]

  const handleToggle = (dayOfWeek: number, checked: boolean) => {
    if (!checked) {
      const serverRows = (rows ?? []).filter((r) => r.dayOfWeek === dayOfWeek)
      if (serverRows.length > 0) {
        setToggleOff({ dayOfWeek, deleting: false })
        return
      }
      setLocalDays((prev) => ({ ...prev, [dayOfWeek]: emptyDay() }))
      return
    }
    setLocalDays((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek]!,
        active: true,
        intervals: [{ tempId: newTempId(), startTime: '09:00', endTime: '17:00' }],
        intervalErrors: {},
        dayError: undefined,
      },
    }))
  }

  const confirmToggleOff = async () => {
    if (!toggleOff || toggleOff.deleting) return
    const { dayOfWeek } = toggleOff
    setToggleOff((prev) => prev && { ...prev, deleting: true, error: undefined })
    const serverRows = (rows ?? []).filter((r) => r.dayOfWeek === dayOfWeek)
    try {
      await Promise.all(serverRows.map((r) => deleteResourceWorkingHour(tenantId!, resourceId, r.id)))
      await queryClient.refetchQueries({ queryKey: workingHoursKey })
      const freshRows = queryClient.getQueryData<ResourceWorkingHour[]>(workingHoursKey) ?? []
      setLocalDays((prev) => ({ ...prev, [dayOfWeek]: buildDayState(dayOfWeek, freshRows) }))
      setToggleOff(null)
    } catch (err: unknown) {
      setToggleOff((prev) =>
        prev
          ? {
              ...prev,
              deleting: false,
              error: extractServerError(err) ?? t('resourceDetail.workingHours.errorSave'),
            }
          : null
      )
    }
  }

  const addInterval = (dayOfWeek: number) => {
    setLocalDays((prev) => {
      const day = prev[dayOfWeek]!
      return {
        ...prev,
        [dayOfWeek]: {
          ...day,
          intervals: [...day.intervals, { tempId: newTempId(), startTime: '09:00', endTime: '17:00' }],
          dayError: undefined,
        },
      }
    })
  }

  const removeInterval = (dayOfWeek: number, tempId: string) => {
    setLocalDays((prev) => {
      const day = prev[dayOfWeek]!
      const intervals = day.intervals.filter((i) => i.tempId !== tempId)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [tempId]: _removed, ...restErrors } = day.intervalErrors
      return {
        ...prev,
        [dayOfWeek]: {
          ...day,
          active: intervals.length > 0,
          intervals,
          intervalErrors: restErrors,
          dayError: undefined,
        },
      }
    })
  }

  const updateIntervalTime = (
    dayOfWeek: number,
    tempId: string,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setLocalDays((prev) => {
      const day = prev[dayOfWeek]!
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [tempId]: _removed, ...restErrors } = day.intervalErrors
      return {
        ...prev,
        [dayOfWeek]: {
          ...day,
          intervals: day.intervals.map((i) => (i.tempId === tempId ? { ...i, [field]: value } : i)),
          intervalErrors: restErrors,
          dayError: undefined,
        },
      }
    })
  }

  const saveDay = async (dayOfWeek: number) => {
    const dayState = localDays[dayOfWeek]
    if (!dayState) return

    const { intervals } = dayState
    const intervalErrors: Record<string, string> = {}
    let valid = true

    for (const iv of intervals) {
      if (!timeRe.test(iv.startTime) || !timeRe.test(iv.endTime)) {
        intervalErrors[iv.tempId] = t('resourceDetail.workingHours.validationTime')
        valid = false
      } else if (parseTimeToMinutes(iv.endTime) <= parseTimeToMinutes(iv.startTime)) {
        intervalErrors[iv.tempId] = t('resourceDetail.workingHours.validationOrder')
        valid = false
      }
    }

    let dayError: string | undefined
    if (valid && hasIntervalOverlap(intervals)) {
      dayError = t('resourceDetail.workingHours.validationOverlap')
      valid = false
    }

    if (!valid) {
      setLocalDays((prev) => ({
        ...prev,
        [dayOfWeek]: { ...prev[dayOfWeek]!, intervalErrors, dayError },
      }))
      return
    }

    setLocalDays((prev) => ({
      ...prev,
      [dayOfWeek]: { ...prev[dayOfWeek]!, saving: true, intervalErrors: {}, dayError: undefined },
    }))

    const serverRows = (rows ?? []).filter((r) => r.dayOfWeek === dayOfWeek)
    const toDelete = serverRows.filter((sr) => !intervals.find((li) => li.id === sr.id))
    const toCreate = intervals.filter((li) => !li.id)
    const toUpdate = intervals.filter((li) => {
      if (!li.id) return false
      const sr = serverRows.find((r) => r.id === li.id)
      return sr && (li.startTime !== sr.startTime || li.endTime !== sr.endTime)
    })

    try {
      // Deletes must complete before creates to avoid server-side overlap conflicts
      await Promise.all(toDelete.map((sr) => deleteResourceWorkingHour(tenantId!, resourceId, sr.id)))
      await Promise.all([
        ...toCreate.map((li) =>
          createResourceWorkingHour(tenantId!, resourceId, {
            dayOfWeek,
            startTime: li.startTime,
            endTime: li.endTime,
          })
        ),
        ...toUpdate.map((li) =>
          updateResourceWorkingHour(tenantId!, resourceId, li.id!, {
            dayOfWeek,
            startTime: li.startTime,
            endTime: li.endTime,
          })
        ),
      ])
      await queryClient.refetchQueries({ queryKey: workingHoursKey })
      const freshRows = queryClient.getQueryData<ResourceWorkingHour[]>(workingHoursKey) ?? []
      setLocalDays((prev) => ({ ...prev, [dayOfWeek]: buildDayState(dayOfWeek, freshRows) }))
    } catch (err: unknown) {
      const errMsg =
        isAxiosError(err) && err.response?.status === 409
          ? t('resourceDetail.workingHours.overlapConflict')
          : (extractServerError(err) ?? t('resourceDetail.workingHours.errorSave'))
      setLocalDays((prev) => ({
        ...prev,
        [dayOfWeek]: { ...prev[dayOfWeek]!, saving: false, dayError: errMsg },
      }))
    }
  }

  const copyMonToWeekdays = () => {
    const monday = localDays[1]
    if (!monday?.active || monday.intervals.length === 0) return
    setLocalDays((prev) => {
      const next = { ...prev }
      for (const d of [2, 3, 4, 5]) {
        next[d] = {
          ...next[d]!,
          active: true,
          intervals: monday.intervals.map((i) => ({
            tempId: newTempId(),
            startTime: i.startTime,
            endTime: i.endTime,
          })),
          intervalErrors: {},
          dayError: undefined,
        }
      }
      return next
    })
  }

  const toggleOffDayName = toggleOff ? formatWeekdayLong(toggleOff.dayOfWeek, calLocale) : ''
  const serverRows = rows ?? []

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-1 p-4 sm:p-6">
        <h2 className="text-lg font-medium text-[var(--text-h)]">
          {t('resourceDetail.workingHours.title')}
        </h2>
        <p className="text-sm text-[var(--text)]">
          {t('resourceDetail.workingHours.description')}
        </p>
      </div>

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText={t('loading.workingHours')}
      />

      {!isPending && !isError && (
        <div className="divide-y divide-[var(--border)]">
          {WEEKDAY_ORDER.map((dayOfWeek) => {
            const day = localDays[dayOfWeek] ?? emptyDay()
            const dirty = isDayDirty(day, serverRows, dayOfWeek)
            const dayName = formatWeekdayLong(dayOfWeek, calLocale)
            const showCopy = dayOfWeek === 1 && day.active && day.intervals.length > 0

            return (
              <div key={dayOfWeek}>
                <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
                  <Switch
                    checked={day.active}
                    onCheckedChange={(checked) => handleToggle(dayOfWeek, checked)}
                    disabled={day.saving}
                    aria-label={dayName}
                  />
                  <span className="min-w-0 flex-1 text-sm font-semibold text-[var(--text-h)]">
                    {dayName}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    {showCopy && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyMonToWeekdays}
                        disabled={day.saving}
                      >
                        <Copy className="size-3.5" />
                        {t('resourceDetail.workingHours.copyToWeekdays')}
                      </Button>
                    )}
                    {dirty && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void saveDay(dayOfWeek)}
                        disabled={day.saving}
                      >
                        {day.saving ? t('common.saving') : t('common.save')}
                      </Button>
                    )}
                  </div>
                </div>

                {day.active && (
                  <div className="flex flex-col gap-2 px-4 pb-4 sm:px-6">
                    {day.intervals.map((interval) => (
                      <div key={interval.tempId}>
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={interval.startTime}
                            onChange={(e) =>
                              updateIntervalTime(dayOfWeek, interval.tempId, 'startTime', e.target.value)
                            }
                            className="w-[7.5rem]"
                            aria-label={t('resourceDetail.workingHours.startLabel')}
                            disabled={day.saving}
                          />
                          <span className="text-sm text-muted-foreground">–</span>
                          <Input
                            type="time"
                            value={interval.endTime}
                            onChange={(e) =>
                              updateIntervalTime(dayOfWeek, interval.tempId, 'endTime', e.target.value)
                            }
                            className="w-[7.5rem]"
                            aria-label={t('resourceDetail.workingHours.endLabel')}
                            disabled={day.saving}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t('resourceDetail.workingHours.removeInterval')}
                            onClick={() => removeInterval(dayOfWeek, interval.tempId)}
                            disabled={day.saving}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                        {day.intervalErrors[interval.tempId] && (
                          <p className="mt-1 text-sm text-destructive" role="alert">
                            {day.intervalErrors[interval.tempId]}
                          </p>
                        )}
                      </div>
                    ))}

                    {day.dayError && <FormError message={day.dayError} />}

                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addInterval(dayOfWeek)}
                        disabled={day.saving}
                      >
                        <Plus className="size-3.5" />
                        {t('resourceDetail.workingHours.addInterval')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Dialog
        open={toggleOff !== null}
        onOpenChange={(next) => {
          if (!next && !toggleOff?.deleting) setToggleOff(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('resourceDetail.workingHours.toggleOffTitle')}</DialogTitle>
            <DialogDescription>
              {t('resourceDetail.workingHours.toggleOffBody', { day: toggleOffDayName })}
            </DialogDescription>
          </DialogHeader>
          {toggleOff?.error && <FormError message={toggleOff.error} />}
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              disabled={toggleOff?.deleting}
              onClick={() => setToggleOff(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={toggleOff?.deleting}
              onClick={() => void confirmToggleOff()}
            >
              {toggleOff?.deleting
                ? t('common.deleting')
                : t('resourceDetail.workingHours.toggleOffConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
