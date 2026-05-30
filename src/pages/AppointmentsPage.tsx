import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import { ActionIcon, Alert, Badge, Group, Loader, Pagination, Stack, Table, Tooltip } from '@mantine/core'
import { IconAlertCircle, IconX } from '@tabler/icons-react'
import {
  AppointmentsTimeline,
  CancelAppointmentConfirmModal,
  Card,
  DataTable,
  DataTableBodyRow,
  DataTableEmptyCell,
  DataTableHeadRow,
  DataTableScroll,
  DataTableTd,
  DataTableTh,
  DropdownPicker,
  PageSearchBar,
  PageSectionHeader,
} from '../components'
import { DatePicker } from '@/components/ui/DatePicker'
import { calendarLocaleFromLng } from '../lib/dateLocale'
import { matchesTableSearch } from '../lib/tableSearch'
import { useAppointments, useAuth, useCancelAppointment, useIsMobile, useResources } from '../hooks'
import { apiErrorMessageForMutation, formatQueryError } from '../lib/errors'
import type { AppointmentStatus, AppointmentWithRelations } from '../types'

const PAGE_SIZE = 10

type SortField = 'guest' | 'service' | 'time' | 'email' | 'phone' | 'status'

function sortList(list: AppointmentWithRelations[], field: SortField | null, asc: boolean) {
  if (!field) return list
  return [...list].sort((a, b) => {
    let av = '', bv = ''
    if (field === 'guest') { av = a.guest.name; bv = b.guest.name }
    else if (field === 'service') { av = a.service.name; bv = b.service.name }
    else if (field === 'time') { av = a.startAt; bv = b.startAt }
    else if (field === 'email') { av = a.guest.email; bv = b.guest.email }
    else if (field === 'phone') { av = a.guest.phone; bv = b.guest.phone }
    else if (field === 'status') { av = a.status; bv = b.status }
    const cmp = av.localeCompare(bv)
    return asc ? cmp : -cmp
  })
}

function useStatusLabels() {
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

function StatusBadge({ status, label }: { status: string; label: string }) {
  const color = status === 'scheduled' ? 'green' : status === 'completed' ? 'blue' : 'gray'
  return <Badge color={color} variant="light" size="sm">{label}</Badge>
}

function formatTime(iso: string, locale: string) {
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
}

function toDateInputValue(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function normalizeStatus(status: string): AppointmentStatus | null {
  if (status === 'scheduled' || status === 'completed' || status === 'canceled') return status
  return null
}

function matchesSearch(apt: AppointmentWithRelations, raw: string, labels: Record<AppointmentStatus, string>) {
  const normalized = normalizeStatus(apt.status)
  const statusText = normalized ? labels[normalized] : apt.status
  return matchesTableSearch(raw, [
    apt.guest.name, apt.guest.email, apt.guest.phone,
    apt.service.name, apt.resource.firstName, apt.resource.lastName,
    apt.status, statusText, apt.notes ?? '', apt.startAt,
  ])
}

function AppointmentsPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const statusLabels = useStatusLabels()
  const calLocale = calendarLocaleFromLng(i18n.language)
  const isMobile = useIsMobile()

  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()))
  const [selectedResourceId, setSelectedResourceId] = useState('')
  const { data: resources = [], isPending: isResourcesPending } = useResources()
  const [search, setSearch] = useState('')
  const [cancelTarget, setCancelTarget] = useState<AppointmentWithRelations | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)

  const ownerResources = useMemo(() => {
    const list = [...resources]
    list.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
    return list
  }, [resources])

  const resourceOptions = useMemo(
    () => ownerResources.map((r) => ({ value: r.id, label: `${r.firstName} ${r.lastName}` })),
    [ownerResources]
  )

  const effectiveResourceId = isOwner ? (selectedResourceId || ownerResources[0]?.id || '') : ''
  const canFetchAppointments = !isOwner || Boolean(effectiveResourceId)
  const queryParams = useMemo(
    () => ({ date: selectedDate, ...(isOwner && effectiveResourceId ? { resourceId: effectiveResourceId } : {}) }),
    [isOwner, selectedDate, effectiveResourceId]
  )

  const { data: appointments, isPending, isError, error } = useAppointments(queryParams, canFetchAppointments)
  const cancelMutation = useCancelAppointment()

  const list = useMemo(() => appointments ?? [], [appointments])
  const filtered = useMemo(
    () => list.filter((apt) => matchesSearch(apt, search, statusLabels)),
    [list, search, statusLabels]
  )
  const displayed = useMemo(() => sortList(filtered, sortField, sortAsc), [filtered, sortField, sortAsc])
  const totalPages = Math.ceil(displayed.length / PAGE_SIZE)
  const paginated = useMemo(
    () => displayed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [displayed, page]
  )

  function handleSort(field: SortField) {
    if (sortField !== field) { setSortField(field); setSortAsc(true) }
    else if (sortAsc) { setSortAsc(false) }
    else { setSortField(null); setSortAsc(true) }
    setPage(1)
  }

  function thDir(field: SortField): 'asc' | 'desc' | null {
    return sortField === field ? (sortAsc ? 'asc' : 'desc') : null
  }

  return (
    <Stack component="main" maw="1500px" mx="auto" w="100%" gap="lg">
      {isMobile ? (
        <>
          <PageSectionHeader title={t('appointments.title')} />
          <AppointmentsTimeline
            appointments={list}
            isPending={isPending || (isOwner && isResourcesPending)}
            isError={isError}
            error={error}
            isOwner={isOwner}
            resourceOptions={resourceOptions}
            selectedResourceId={effectiveResourceId}
            onResourceChange={setSelectedResourceId}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </>
      ) : (
        <>
          <Stack gap="sm">
            <PageSectionHeader title={t('appointments.title')} />
            <PageSearchBar
              id="appointments-search"
              value={search}
              onChange={(v) => { setSearch(v); setPage(1) }}
              actions={
                <Group gap="sm" wrap="nowrap">
                  <DatePicker
                    value={selectedDate}
                    onChange={(d) => { setSelectedDate(d); setPage(1) }}
                    aria-label={t('appointments.filters.date')}
                  />
                  {isOwner && (
                    <DropdownPicker
                      value={effectiveResourceId}
                      onValueChange={(id) => { setSelectedResourceId(id); setPage(1) }}
                      options={resourceOptions}
                      ariaLabel={t('appointments.filters.resource')}
                      placeholder={t('appointments.filters.resource')}
                    />
                  )}
                </Group>
              }
            />
          </Stack>

          <Card style={{ overflow: 'hidden' }}>
            <DataTableScroll variant="page" height="calc(100vh - 220px)">
              <DataTable variant="page" minWidth={700}>
                <thead>
                  <DataTableHeadRow variant="page">
                    <DataTableTh variant="page" sortable sortDirection={thDir('guest')} onSort={() => handleSort('guest')}>
                      {t('common.fullName')}
                    </DataTableTh>
                    <DataTableTh variant="page" sortable sortDirection={thDir('service')} onSort={() => handleSort('service')}>
                      {t('common.service')}
                    </DataTableTh>
                    <DataTableTh variant="page" sortable sortDirection={thDir('time')} onSort={() => handleSort('time')}>
                      {t('common.time')}
                    </DataTableTh>
                    <DataTableTh variant="page" sortable sortDirection={thDir('email')} onSort={() => handleSort('email')}>
                      {t('common.email')}
                    </DataTableTh>
                    <DataTableTh variant="page" sortable sortDirection={thDir('phone')} onSort={() => handleSort('phone')}>
                      {t('common.phone')}
                    </DataTableTh>
                    <DataTableTh variant="page" sortable sortDirection={thDir('status')} onSort={() => handleSort('status')}>
                      {t('common.status')}
                    </DataTableTh>
                    <DataTableTh variant="page" style={{ width: 56 }} />
                  </DataTableHeadRow>
                </thead>
                <tbody>
                  {(isPending || (isOwner && isResourcesPending)) ? (
                    <Table.Tr>
                      <DataTableEmptyCell variant="page" colSpan={7}>
                        <Loader size="sm" />
                      </DataTableEmptyCell>
                    </Table.Tr>
                  ) : isError ? (
                    <Table.Tr>
                      <DataTableEmptyCell variant="page" colSpan={7}>
                        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                          {formatQueryError(error)}
                        </Alert>
                      </DataTableEmptyCell>
                    </Table.Tr>
                  ) : list.length === 0 ? (
                    <Table.Tr>
                      <DataTableEmptyCell variant="page" colSpan={7}>
                        {isOwner ? t('appointments.emptyForDateAndResource') : t('appointments.emptyForDate')}
                      </DataTableEmptyCell>
                    </Table.Tr>
                  ) : filtered.length === 0 ? (
                    <Table.Tr>
                      <DataTableEmptyCell variant="page" colSpan={7}>{t('common.emptySearch')}</DataTableEmptyCell>
                    </Table.Tr>
                  ) : (
                    paginated.map((apt) => {
                      const normalized = normalizeStatus(apt.status)
                      const statusLabel = normalized ? statusLabels[normalized] : apt.status
                      const isScheduled = apt.status === 'scheduled'
                      return (
                        <DataTableBodyRow
                          key={apt.id}
                          hoverable
                          onMouseEnter={() => setHoveredId(apt.id)}
                          onMouseLeave={() => setHoveredId(null)}
                        >
                          <DataTableTd variant="page">{apt.guest.name}</DataTableTd>
                          <DataTableTd variant="page">{apt.service.name}</DataTableTd>
                          <DataTableTd variant="page">{formatTime(apt.startAt, calLocale)}</DataTableTd>
                          <DataTableTd variant="page">{apt.guest.email}</DataTableTd>
                          <DataTableTd variant="page">{apt.guest.phone}</DataTableTd>
                          <DataTableTd variant="page">
                            <StatusBadge status={apt.status} label={statusLabel} />
                          </DataTableTd>
                          <DataTableTd variant="page" align="right" style={{ width: 56 }}>
                            <Group gap={8} justify="flex-end" style={{ visibility: hoveredId === apt.id && isScheduled ? 'visible' : 'hidden' }}>
                              <Tooltip label={t('cancelAppointment.action')} withArrow>
                                <ActionIcon
                                  variant="outline"
                                  color="red"
                                  size="md"
                                  onClick={(e) => { e.stopPropagation(); setCancelTarget(apt) }}
                                  aria-label={t('cancelAppointment.action')}
                                >
                                  <IconX size={16} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>
                          </DataTableTd>
                        </DataTableBodyRow>
                      )
                    })
                  )}
                </tbody>
              </DataTable>
            </DataTableScroll>
            {!isPending && !isError && totalPages > 1 && (
              <Group justify="center" p="md">
                <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
              </Group>
            )}
          </Card>
        </>
      )}

      <CancelAppointmentConfirmModal
        open={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        guestName={cancelTarget?.guest.name ?? ''}
        serviceName={cancelTarget?.service.name ?? ''}
        isPending={cancelMutation.isPending}
        onConfirm={async () => {
          if (!cancelTarget) return
          try {
            await cancelMutation.mutateAsync(cancelTarget.id)
            notifications.show({ message: t('cancelAppointment.success'), color: 'green' })
            setCancelTarget(null)
          } catch (err: unknown) {
            notifications.show({ message: apiErrorMessageForMutation(err, t, 'cancelAppointment.error'), color: 'red' })
          }
        }}
      />
    </Stack>
  )
}

export default AppointmentsPage
