import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import { Button, Checkbox, Group, Pagination, Paper, Stack, Text } from '@mantine/core'
import {
  Card,
  CreateServiceModal,
  DataTable,
  DataTableBodyRow,
  DataTableEmptyCell,
  DataTableHeadRow,
  DataTableScroll,
  DataTableTd,
  DataTableTh,
  DeleteServiceConfirmModal,
  EditServiceModal,
  PageSearchBar,
  PageSectionHeader,
  QueryStatusBanner,
} from '../components'
import { matchesTableSearch } from '../lib/tableSearch'
import { useDeleteService, useServices } from '../hooks'
import { apiErrorMessageForMutation } from '../lib/errors'
import type { Service } from '../types'

const PAGE_SIZE = 20

type SortField = 'name' | 'duration' | 'description' | 'active'

function sortList(list: Service[], field: SortField | null, asc: boolean) {
  if (!field) return list
  return [...list].sort((a, b) => {
    let cmp = 0
    if (field === 'name') cmp = a.name.localeCompare(b.name)
    else if (field === 'duration') cmp = a.durationMinutes - b.durationMinutes
    else if (field === 'description') cmp = (a.description ?? '').localeCompare(b.description ?? '')
    else if (field === 'active') cmp = Number(b.isActive) - Number(a.isActive)
    return asc ? cmp : -cmp
  })
}

function ServicesPage() {
  const { t } = useTranslation()
  const { data: services, isPending, isError, error } = useServices()
  const deleteMutation = useDeleteService()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)
  const [deleteService, setDeleteService] = useState<Service | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    const list = [...(services ?? [])]
    list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return a.name.localeCompare(b.name)
    })
    return list
  }, [services])

  const filtered = useMemo(
    () => sorted.filter((s) => matchesTableSearch(search, [s.name, s.description ?? '', s.durationMinutes, s.sortOrder])),
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

  const allSelected = paginated.length > 0 && paginated.every((s) => selectedIds.has(s.id))
  const someSelected = paginated.some((s) => selectedIds.has(s.id)) && !allSelected
  const hasSelection = selectedIds.size > 0
  const singleSelected = selectedIds.size === 1
    ? paginated.find((s) => selectedIds.has(s.id)) ?? null
    : null

  return (
    <Stack component="main" maw={1400} ml='lg' w="100%" gap="lg">
      <Stack gap="sm">
        <PageSectionHeader title={t('services.title')} />
        <PageSearchBar
          id="services-search"
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          actions={<Button onClick={() => setCreateOpen(true)}>{t('services.createService')}</Button>}
        />
      </Stack>

      <QueryStatusBanner isPending={isPending} isError={isError} error={error} loadingText={t('loading.services')} />

      {!isPending && !isError && (
        <Card style={{ overflow: 'hidden' }}>
          <DataTableScroll variant="page">
            <DataTable variant="page" minWidth={880}>
              <thead>
                <DataTableHeadRow variant="page">
                  <DataTableTh variant="page" style={{ width: 40 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(e) =>
                        setSelectedIds(e.currentTarget.checked ? new Set(paginated.map((s) => s.id)) : new Set())
                      }
                      aria-label="Select all"
                    />
                  </DataTableTh>
                  <DataTableTh variant="page" sortable sortDirection={thDir('name')} onSort={() => handleSort('name')}>
                    {t('common.name')}
                  </DataTableTh>
                  <DataTableTh variant="page" sortable sortDirection={thDir('duration')} onSort={() => handleSort('duration')}>
                    {t('common.duration')}
                  </DataTableTh>
                  <DataTableTh variant="page" sortable sortDirection={thDir('description')} onSort={() => handleSort('description')}>
                    {t('services.description')}
                  </DataTableTh>
                  <DataTableTh variant="page" sortable sortDirection={thDir('active')} onSort={() => handleSort('active')}>
                    {t('common.active')}
                  </DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr><DataTableEmptyCell variant="page" colSpan={5}>{t('services.empty')}</DataTableEmptyCell></tr>
                ) : filtered.length === 0 ? (
                  <tr><DataTableEmptyCell variant="page" colSpan={5}>{t('common.emptySearch')}</DataTableEmptyCell></tr>
                ) : (
                  paginated.map((s) => (
                    <DataTableBodyRow
                      key={s.id}
                      hoverable
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleRow(s.id)}
                    >
                      <DataTableTd variant="page">
                        <Checkbox
                          checked={selectedIds.has(s.id)}
                          onChange={() => {}}
                          onClick={(e) => { e.stopPropagation(); toggleRow(s.id) }}
                          aria-label={`Select ${s.name}`}
                        />
                      </DataTableTd>
                      <DataTableTd variant="page">{s.name}</DataTableTd>
                      <DataTableTd variant="page">{t('common.minutes', { count: s.durationMinutes })}</DataTableTd>
                      <DataTableTd variant="page" style={{ maxWidth: 220 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.description ?? t('common.dash')}
                        </span>
                      </DataTableTd>
                      <DataTableTd variant="page">{s.isActive ? t('common.yes') : t('common.no')}</DataTableTd>
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
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: 0,
          right: 0,
          zIndex: 200,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: hasSelection ? 1 : 0,
          transform: hasSelection ? 'none' : 'translateY(8px)',
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}
      >
        <Paper shadow="md" p="sm" radius="md" withBorder style={{ pointerEvents: hasSelection ? 'auto' : 'none' }}>
          <Group gap="md" wrap="nowrap">
            <Text size="sm" fw={500}>{t('common.nSelected', { count: selectedIds.size })}</Text>
            <Button
              size="sm"
              variant="default"
              disabled={!singleSelected}
              onClick={() => { if (singleSelected) setEditService(singleSelected) }}
            >
              {t('services.edit')}
            </Button>
            <Button
              size="sm"
              color="red"
              variant="light"
              disabled={!singleSelected}
              onClick={() => { if (singleSelected) setDeleteService(singleSelected) }}
            >
              {t('common.delete')}
            </Button>
            <Button size="sm" variant="default" onClick={() => setSelectedIds(new Set())}>
              {t('common.clearSelection')}
            </Button>
          </Group>
        </Paper>
      </div>

      <CreateServiceModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditServiceModal
        open={editService != null}
        onClose={() => { setEditService(null); setSelectedIds(new Set()) }}
        service={editService}
      />
      <DeleteServiceConfirmModal
        open={deleteService != null}
        onClose={() => setDeleteService(null)}
        serviceName={deleteService?.name ?? ''}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleteService) return
          try {
            await deleteMutation.mutateAsync(deleteService.id)
            setDeleteService(null)
            setSelectedIds(new Set())
          } catch (err: unknown) {
            notifications.show({ message: apiErrorMessageForMutation(err, t, 'deleteService.error'), color: 'red' })
          }
        }}
      />
    </Stack>
  )
}

export default ServicesPage
