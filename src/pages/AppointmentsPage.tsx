import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, PageSectionHeader, QueryStatusBanner } from '../components'
import { calendarLocaleFromLng } from '../lib/dateLocale'
import { useAppointments } from '../hooks'
import type { AppointmentStatus } from '../types'

const pageClass = 'flex flex-1 flex-col gap-4 p-4 text-left sm:gap-6 sm:p-6 md:gap-8 md:p-8'

function useAppointmentStatusLabels() {
  const { t } = useTranslation()
  return useMemo(
    (): Record<AppointmentStatus, string> => ({
      scheduled: t('appointments.statusScheduled'),
      completed: t('appointments.statusCompleted'),
      canceled: t('appointments.statusCanceled'),
    }),
    [t]
  )
}

function formatAppointmentDate(iso: string, locale: string) {
  const date = new Date(iso)
  return date.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatAppointmentTime(iso: string, locale: string) {
  const date = new Date(iso)
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizeStatus(status: string): AppointmentStatus | null {
  if (status === 'scheduled' || status === 'completed' || status === 'canceled') {
    return status
  }
  return null
}

function StatusBadge({
  status,
  labels,
}: {
  status: string
  labels: Record<AppointmentStatus, string>
}) {
  const normalized = normalizeStatus(status)
  const label = normalized ? labels[normalized] : status
  const styleClass = normalized
    ? {
        scheduled:
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        completed:
          'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
        canceled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      }[normalized]
    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styleClass}`}>
      {label}
    </span>
  )
}

function AppointmentsPage() {
  const { t, i18n } = useTranslation()
  const statusLabels = useAppointmentStatusLabels()
  const calLocale = calendarLocaleFromLng(i18n.language)
  const { data: appointments, isPending, isError, error } = useAppointments()

  return (
    <main className={pageClass}>
      <PageSectionHeader title={t('appointments.title')} />

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText={t('loading.appointments')}
      />

      {!isPending && !isError && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-h)] sm:px-4">
                    {t('common.date')}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-h)] sm:px-4">
                    {t('common.time')}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-h)] sm:px-4">
                    {t('common.client')}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-h)] sm:px-4">
                    {t('common.service')}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-h)] sm:px-4">
                    {t('common.status')}
                  </th>
                  <th className="px-3 py-3 text-left text-sm font-medium text-[var(--text-h)] sm:px-4">
                    {t('common.notes')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(appointments ?? []).length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-3 py-8 text-center text-sm text-[var(--text)] sm:px-4"
                    >
                      {t('appointments.empty')}
                    </td>
                  </tr>
                ) : (
                  (appointments ?? []).map((apt) => (
                    <tr
                      key={apt.id}
                      className="border-b border-[var(--border)] last:border-b-0 transition hover:bg-[var(--bg)]"
                    >
                      <td className="px-3 py-3 text-sm text-[var(--text-h)] sm:px-4">
                        {formatAppointmentDate(apt.startAt, calLocale)}
                      </td>
                      <td className="px-3 py-3 text-sm text-[var(--text)] sm:px-4">
                        {formatAppointmentTime(apt.startAt, calLocale)}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <div>
                          <p className="text-sm font-medium text-[var(--text-h)]">
                            {apt.guest.name}
                          </p>
                          <p className="text-xs text-[var(--text)]">{apt.guest.email}</p>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-sm text-[var(--text)] sm:px-4">
                        {apt.service.name}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <StatusBadge status={apt.status} labels={statusLabels} />
                      </td>
                      <td className="max-w-[200px] truncate px-3 py-3 text-sm text-[var(--text)] sm:px-4">
                        {apt.notes ?? t('common.dash')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </main>
  )
}

export default AppointmentsPage
