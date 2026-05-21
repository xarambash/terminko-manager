import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { Button, Checkbox, Group, Pagination, Paper, Stack, Text } from '@mantine/core'
import {
  Card,
  CreateResourceModal,
  DataTable,
  DataTableBodyRow,
  DataTableEmptyCell,
  DataTableHeadRow,
  DataTableScroll,
  DataTableTd,
  DataTableTh,
  DeleteResourceConfirmModal,
  PageSearchBar,
  PageSectionHeader,
  QueryStatusBanner,
} from '../components'
import { matchesTableSearch } from '../lib/tableSearch'
import { useDeleteResource, useResources } from '../hooks'
import { apiErrorMessageForMutation } from '../lib/errors'
import type { Resource } from '../types/resources'

const PAGE_SIZE = 20

type SortField = 'name' | 'email' | 'phone' | 'active'

function sortList(list: Resource[], field: SortField | null, asc: boolean): Resource[] {
  if (!field) return list
  return [...list].sort((a, b) => {
    let cmp = 0
    if (field === 'name') cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
    else if (field === 'email') cmp = (a.email ?? '').localeCompare(b.email ?? '')
    else if (field === 'phone') cmp = (a.phone ?? '').localeCompare(b.phone ?? '')
    else if (field === 'active') cmp = Number(b.isActive) - Number(a.isActive)
    return asc ? cmp : -cmp
  })
}

function ResourcesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)

  const { data: resources, isPending, isError, error } = useResources()
  const deleteMutation = useDeleteResource()

  const sorted = useMemo(() => {
    const list = [...(resources ?? [])]
    list.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
    return list
  }, [resources])

  const filtered = useMemo(
    () => sorted.filter((r) => matchesTableSearch(search, [r.firstName, r.lastName, r.email ?? '', r.phone ?? ''])),
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

  const allSelected = paginated.length > 0 && paginated.every((r) => selectedIds.has(r.id))
  const someSelected = paginated.some((r) => selectedIds.has(r.id)) && !allSelected
  const hasSelection = selectedIds.size > 0
  const singleSelected = selectedIds.size === 1
    ? paginated.find((r) => selectedIds.has(r.id)) ?? null
    : null

  return (
    <Stack component="main" maw="1500px" mx="auto" w="100%" gap="lg">
      <Stack gap="sm">
        <PageSectionHeader title={t('resources.title')} />
        <PageSearchBar
          id="resources-search"
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          actions={<Button onClick={() => setModalOpen(true)}>{t('resources.createResource')}</Button>}
        />
      </Stack>

      <QueryStatusBanner isPending={isPending} isError={isError} error={error} loadingText={t('loading.resources')} />

      {!isPending && !isError && (
        <Card style={{ overflow: 'hidden' }}>
          <DataTableScroll variant="page">
            <DataTable variant="page" minWidth={640}>
              <thead>
                <DataTableHeadRow variant="page">
                  <DataTableTh variant="page" style={{ width: 40 }}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(e) =>
                        setSelectedIds(e.currentTarget.checked ? new Set(paginated.map((r) => r.id)) : new Set())
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
                  <DataTableTh variant="page" sortable sortDirection={thDir('active')} onSort={() => handleSort('active')}>
                    {t('common.active')}
                  </DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr><DataTableEmptyCell variant="page" colSpan={5}>{t('resources.empty')}</DataTableEmptyCell></tr>
                ) : filtered.length === 0 ? (
                  <tr><DataTableEmptyCell variant="page" colSpan={5}>{t('common.emptySearch')}</DataTableEmptyCell></tr>
                ) : (
                  paginated.map((r) => (
                    <DataTableBodyRow
                      key={r.id}
                      hoverable
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleRow(r.id)}
                    >
                      <DataTableTd variant="page">
                        <Checkbox
                          checked={selectedIds.has(r.id)}
                          onChange={() => {}}
                          onClick={(e) => { e.stopPropagation(); toggleRow(r.id) }}
                          aria-label={`Select ${r.firstName} ${r.lastName}`}
                        />
                      </DataTableTd>
                      <DataTableTd variant="page">{r.firstName} {r.lastName}</DataTableTd>
                      <DataTableTd variant="page">{r.email ?? t('common.dash')}</DataTableTd>
                      <DataTableTd variant="page">{r.phone ?? t('common.dash')}</DataTableTd>
                      <DataTableTd variant="page">{r.isActive ? t('common.yes') : t('common.no')}</DataTableTd>
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
              onClick={() => { if (singleSelected) navigate(`/resources/${singleSelected.id}`) }}
            >
              {t('resources.view')}
            </Button>
            <Button
              size="sm"
              color="red"
              variant="light"
              disabled={!singleSelected}
              onClick={() => { if (singleSelected) setDeleteTarget(singleSelected) }}
            >
              {t('common.delete')}
            </Button>
            <Button size="sm" variant="default" onClick={() => setSelectedIds(new Set())}>
              {t('common.clearSelection')}
            </Button>
          </Group>
        </Paper>
      </div>

      <CreateResourceModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <DeleteResourceConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        resourceName={deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ''}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteMutation.mutateAsync(deleteTarget.id)
            setDeleteTarget(null)
            setSelectedIds(new Set())
          } catch (err: unknown) {
            notifications.show({ message: apiErrorMessageForMutation(err, t, 'deleteResource.error'), color: 'red' })
          }
        }}
      />
    </Stack>
  )
}

export default ResourcesPage
