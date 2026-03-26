import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  DataTable,
  DataTableBodyRow,
  DataTableEmptyCell,
  DataTableHeadRow,
  DataTableScroll,
  DataTableTd,
  DataTableTh,
  PageSectionHeader,
  QueryStatusBanner,
} from '../components'
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
          <DataTableScroll variant="page">
            <DataTable variant="page" minWidth={600}>
              <thead>
                <DataTableHeadRow variant="page">
                  <DataTableTh variant="page">{t('common.date')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.time')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.client')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.service')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.status')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.notes')}</DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {(appointments ?? []).length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="page" colSpan={6}>
                      {t('appointments.empty')}
                    </DataTableEmptyCell>
                  </tr>
                ) : (
                  (appointments ?? []).map((apt) => (
                    <DataTableBodyRow key={apt.id} hoverable>
                      <DataTableTd variant="page" className="text-[var(--text-h)]">
                        {formatAppointmentDate(apt.startAt, calLocale)}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {formatAppointmentTime(apt.startAt, calLocale)}
                      </DataTableTd>
                      <DataTableTd variant="page">
                        <div>
                          <p className="text-sm font-medium text-[var(--text-h)]">
                            {apt.guest.name}
                          </p>
                          <p className="text-xs text-[var(--text)]">{apt.guest.email}</p>
                        </div>
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {apt.service.name}
                      </DataTableTd>
                      <DataTableTd variant="page">
                        <StatusBadge status={apt.status} labels={statusLabels} />
                      </DataTableTd>
                      <DataTableTd
                        variant="page"
                        className="max-w-[200px] truncate text-[var(--text)]"
                      >
                        {apt.notes ?? t('common.dash')}
                      </DataTableTd>
                    </DataTableBodyRow>
                  ))
                )}
              </tbody>
            </DataTable>
          </DataTableScroll>
        </Card>
      )}
    </main>
  )
}

export default AppointmentsPage
