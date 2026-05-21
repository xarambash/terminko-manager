import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Affix, Button, Checkbox, Group, Pagination, Paper, Stack, Table, Text, Transition } from '@mantine/core'
import {
  Card,
  DataTable,
  DataTableBodyRow,
  DataTableEmptyCell,
  DataTableHeadRow,
  DataTableScroll,
  DataTableTd,
  DataTableTh,
  GuestActionPlaceholderModal,
  PageSearchBar,
  PageSectionHeader,
  QueryStatusBanner,
} from '../components'
import { matchesTableSearch } from '../lib/tableSearch'
import { useGuests } from '../hooks'
import type { Guest } from '../types/guests'

const PAGE_SIZE = 20

type SortField = 'name' | 'email' | 'phone' | 'penaltyPoints' | 'status' | 'bannedUntil'

function sortList(list: Guest[], field: SortField | null, asc: boolean) {
  if (!field) return list
  return [...list].sort((a, b) => {
    let cmp = 0
    if (field === 'name') cmp = a.name.localeCompare(b.name)
    else if (field === 'email') cmp = a.email.localeCompare(b.email)
    else if (field === 'phone') cmp = a.phone.localeCompare(b.phone)
    else if (field === 'penaltyPoints') cmp = a.penaltyPoints - b.penaltyPoints
    else if (field === 'status') cmp = Number(b.isBanned) - Number(a.isBanned)
    else if (field === 'bannedUntil') cmp = (a.bannedUntil ?? '').localeCompare(b.bannedUntil ?? '')
    return asc ? cmp : -cmp
  })
}

function formatDate(iso: string | null, locale: string) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

function GuestsPage() {
  const { t, i18n } = useTranslation()
  const { data: guests, isPending, isError, error } = useGuests()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ guest: Guest; action: 'ban' | 'unban' } | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    const list = [...(guests ?? [])]
    list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [guests])

  const filtered = useMemo(
    () => sorted.filter((g) => matchesTableSearch(search, [g.name, g.email, g.phone, g.notes ?? ''])),
    [sorted, search]
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

  function handlePageChange(p: number) {
    setPage(p)
    setSelectedIds(new Set())
  }

  function thDir(field: SortField): 'asc' | 'desc' | null {
    return sortField === field ? (sortAsc ? 'asc' : 'desc') : null
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allSelected = paginated.length > 0 && paginated.every((g) => selectedIds.has(g.id))
  const someSelected = paginated.some((g) => selectedIds.has(g.id)) && !allSelected
  const hasSelection = selectedIds.size > 0
  const singleSelected = selectedIds.size === 1
    ? paginated.find((g) => selectedIds.has(g.id)) ?? null
    : null

  const locale = i18n.language === 'sr' ? 'sr-Latn-RS' : 'en-GB'

  return (
    <Stack component="main" maw="1500px" mx="auto"  w="100%" gap="lg">
      <Stack gap="sm">
        <PageSectionHeader title={t('guests.title')} />
        <PageSearchBar id="guests-search" value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
      </Stack>

      <QueryStatusBanner isPending={isPending} isError={isError} error={error} loadingText={t('loading.guests')} />

      {!isPending && !isError && (
        <Card style={{ overflow: 'hidden' }}>
          <DataTableScroll variant="page">
            <DataTable variant="page" minWidth={960}>
              <thead>
                <DataTableHeadRow variant="page">
                  <DataTableTh variant="page" style={{ width: 40 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(e) =>
                        setSelectedIds(e.currentTarget.checked ? new Set(paginated.map((g) => g.id)) : new Set())
                      }
                      aria-label="Select all"
                    />
                  </DataTableTh>
                  <DataTableTh variant="page" sortable sortDirection={thDir('name')} onSort={() => handleSort('name')}>
                    {t('common.name')}
                  </DataTableTh>
                  <DataTableTh variant="page" sortable sortDirection={thDir('email')} onSort={() => handleSort('email')}>
                    {t('common.email')}
                  </DataTableTh>
                  <DataTableTh variant="page" sortable sortDirection={thDir('phone')} onSort={() => handleSort('phone')}>
                    {t('common.phone')}
                  </DataTableTh>
                  <DataTableTh variant="page" sortable sortDirection={thDir('penaltyPoints')} onSort={() => handleSort('penaltyPoints')}>
                    {t('guests.penaltyPoints')}
                  </DataTableTh>
                  <DataTableTh variant="page" sortable sortDirection={thDir('status')} onSort={() => handleSort('status')}>
                    {t('common.status')}
                  </DataTableTh>
                  <DataTableTh variant="page" sortable sortDirection={thDir('bannedUntil')} onSort={() => handleSort('bannedUntil')}>
                    {t('guests.bannedUntil')}
                  </DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <Table.Tr><DataTableEmptyCell variant="page" colSpan={7}>{t('guests.empty')}</DataTableEmptyCell></Table.Tr>
                ) : filtered.length === 0 ? (
                  <Table.Tr><DataTableEmptyCell variant="page" colSpan={7}>{t('common.emptySearch')}</DataTableEmptyCell></Table.Tr>
                ) : (
                  paginated.map((g) => (
                    <DataTableBodyRow
                      key={g.id}
                      hoverable
                    >
                      <DataTableTd variant="page" style={{ cursor: 'pointer' }}>
                        <Checkbox
                          checked={selectedIds.has(g.id)}
                          onChange={() => {}}
                          onClick={() => toggleRow(g.id)}
                          aria-label={`Select ${g.name}`}
                        />
                      </DataTableTd>
                      <DataTableTd variant="page">{g.name}</DataTableTd>
                      <DataTableTd variant="page">{g.email}</DataTableTd>
                      <DataTableTd variant="page">{g.phone}</DataTableTd>
                      <DataTableTd variant="page">{g.penaltyPoints}</DataTableTd>
                      <DataTableTd variant="page">
                        {g.isBanned ? t('guests.statusBanned') : t('guests.statusActive')}
                      </DataTableTd>
                      <DataTableTd variant="page">
                        {g.isBanned && g.bannedUntil ? formatDate(g.bannedUntil, locale) ?? t('common.dash') : t('common.dash')}
                      </DataTableTd>
                    </DataTableBodyRow>
                  ))
                )}
              </tbody>
            </DataTable>
          </DataTableScroll>
          {totalPages > 1 && (
            <Group justify="center" p="md">
              <Pagination total={totalPages} value={page} onChange={handlePageChange} size="sm" />
            </Group>
          )}
        </Card>
      )}

      {/* Floating selection action bar */}
      <Affix position={{ bottom: 24, left: 0, right: 0 }} zIndex={200} style={{ display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <Transition
          mounted={hasSelection}
          transition={{ in: { opacity: 1, transform: 'translateY(0)' }, out: { opacity: 0, transform: 'translateY(8px)' }, transitionProperty: 'opacity, transform' }}
          duration={200}
          timingFunction="ease"
        >
          {(styles) => (
            <Paper shadow="md" p="sm" radius="md" withBorder style={{ ...styles, pointerEvents: 'auto' }}>
              <Group gap="md" wrap="nowrap">
                <Text size="sm" fw={500}>{t('common.nSelected', { count: selectedIds.size })}</Text>
                <Button
                  size="sm"
                  variant="light"
                  disabled={!singleSelected || singleSelected.isBanned}
                  onClick={() => { if (singleSelected) setModal({ guest: singleSelected, action: 'ban' }) }}
                >
                  {t('guests.ban.action')}
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  disabled={!singleSelected || !singleSelected.isBanned}
                  onClick={() => { if (singleSelected) setModal({ guest: singleSelected, action: 'unban' }) }}
                >
                  {t('guests.unban.action')}
                </Button>
                <Button size="sm" variant="default" onClick={() => setSelectedIds(new Set())}>
                  {t('common.clearSelection')}
                </Button>
              </Group>
            </Paper>
          )}
        </Transition>
      </Affix>

      <GuestActionPlaceholderModal
        open={modal != null}
        onClose={() => setModal(null)}
        guestName={modal?.guest.name ?? ''}
        action={modal?.action ?? 'ban'}
      />
    </Stack>
  )
}

export default GuestsPage
