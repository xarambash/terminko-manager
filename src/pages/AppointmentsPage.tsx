import { useMemo, useState } from 'react'
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
  DropdownPicker,
  ListSearchField,
  PageSectionHeader,
  QueryStatusBanner,
} from '../components'
import { DatePicker } from '@/components/ui/DatePicker'
import { calendarLocaleFromLng } from '../lib/dateLocale'
import { matchesTableSearch } from '../lib/tableSearch'
import { useAppointments, useAuth, useResources } from '../hooks'
import type { AppointmentStatus, AppointmentWithRelations } from '../types'

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

function formatAppointmentTime(iso: string, locale: string) {
  const date = new Date(iso)
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function normalizeStatus(status: string): AppointmentStatus | null {
  if (status === 'scheduled' || status === 'completed' || status === 'canceled') {
    return status
  }
  return null
}

function appointmentMatchesSearch(
  apt: AppointmentWithRelations,
  raw: string,
  statusLabels: Record<AppointmentStatus, string>
) {
  const normalized = normalizeStatus(apt.status)
  const statusText = normalized ? statusLabels[normalized] : apt.status
  return matchesTableSearch(raw, [
    apt.guest.name,
    apt.guest.email,
    apt.guest.phone,
    apt.service.name,
    apt.resource.firstName,
    apt.resource.lastName,
    apt.status,
    statusText,
    apt.notes ?? '',
    apt.startAt,
  ])
}

function AppointmentsPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const statusLabels = useAppointmentStatusLabels()
  const calLocale = calendarLocaleFromLng(i18n.language)
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()))
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const { data: resources = [] } = useResources()
  const [search, setSearch] = useState('')

  const ownerResources = useMemo(() => {
    const list = [...resources]
    list.sort((a, b) => {
      const aName = `${a.firstName} ${a.lastName}`.trim()
      const bName = `${b.firstName} ${b.lastName}`.trim()
      return aName.localeCompare(bName)
    })
    return list
  }, [resources])
  const resourceOptions = useMemo(
    () =>
      ownerResources.map((resource) => ({
        value: resource.id,
        label: `${resource.firstName} ${resource.lastName}`,
      })),
    [ownerResources]
  )

  const effectiveResourceId = isOwner ? (selectedResourceId || ownerResources[0]?.id || '') : ''
  const canFetchAppointments = !isOwner || Boolean(effectiveResourceId)
  const queryParams = useMemo(
    () => ({
      date: selectedDate,
      ...(isOwner && effectiveResourceId ? { resourceId: effectiveResourceId } : {}),
    }),
    [isOwner, selectedDate, effectiveResourceId]
  )
  const { data: appointments, isPending, isError, error } = useAppointments(
    queryParams,
    canFetchAppointments
  )

  const list = useMemo(() => appointments ?? [], [appointments])
  const filtered = useMemo(
    () => list.filter((apt) => appointmentMatchesSearch(apt, search, statusLabels)),
    [list, search, statusLabels]
  )

  return (
    <main className={pageClass}>
      <div className="flex flex-col gap-4">
        <PageSectionHeader title={t('appointments.title')} />
        <div className="flex flex-wrap items-center gap-2">
          <ListSearchField
            id="appointments-search"
            value={search}
            onChange={setSearch}
            containerClassName="max-w-none min-w-[16rem] flex-1"
          />
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            aria-label={t('appointments.filters.date')}
            className="w-auto"
          />
          {isOwner && (
            <DropdownPicker
              value={effectiveResourceId}
              onValueChange={setSelectedResourceId}
              options={resourceOptions}
              ariaLabel={t('appointments.filters.resource')}
              placeholder={t('appointments.filters.resource')}
              className="h-8 w-[13.5rem]"
              size="default"
            />
          )}
        </div>
        {isOwner && !canFetchAppointments && (
          <p className="text-sm text-[var(--text)]">{t('appointments.selectResourceHint')}</p>
        )}
      </div>

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText={t('loading.appointments')}
      />

      {!canFetchAppointments ? null : !isPending && !isError && (
        <Card className="overflow-hidden p-0">
          <DataTableScroll variant="page">
            <DataTable variant="page" minWidth={600}>
              <thead>
                <DataTableHeadRow variant="page">
                  <DataTableTh variant="page">{t('common.time')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.service')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.fullName')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.email')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.phone')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.notes')}</DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="page" colSpan={6}>
                      {isOwner
                        ? t('appointments.emptyForDateAndResource')
                        : t('appointments.emptyForDate')}
                    </DataTableEmptyCell>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="page" colSpan={6}>
                      {t('common.emptySearch')}
                    </DataTableEmptyCell>
                  </tr>
                ) : (
                  filtered.map((apt) => (
                    <DataTableBodyRow key={apt.id} hoverable>
                      <DataTableTd variant="page" className="text-[var(--text-h)]">
                        {formatAppointmentTime(apt.startAt, calLocale)}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text-h)]">
                        {apt.service.name}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text-h)]">
                        {apt.guest.name}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {apt.guest.email}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {apt.guest.phone}
                      </DataTableTd>
                       <DataTableTd
                        variant="page"
                        className="max-w-[200px] truncate text-[var(--text-h)]">
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
