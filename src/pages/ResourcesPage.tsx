import { useMemo, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { ActionIcon, Button, Group, Pagination, Stack } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'
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

  function thDir(field: SortField): 'asc' | 'desc' | null {
    return sortField === field ? (sortAsc ? 'asc' : 'desc') : null
  }

  return (
    <Stack component="main" maw={1400} ml="lg" w="100%" gap="lg">
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
                  <DataTableTh variant="page" />
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
                      role="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/resources/${r.id}`)}
                      onKeyDown={(e: KeyboardEvent<HTMLTableRowElement>) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/resources/${r.id}`) }
                      }}
                    >
                      <DataTableTd variant="page">{r.firstName} {r.lastName}</DataTableTd>
                      <DataTableTd variant="page">{r.email ?? t('common.dash')}</DataTableTd>
                      <DataTableTd variant="page">{r.phone ?? t('common.dash')}</DataTableTd>
                      <DataTableTd variant="page">{r.isActive ? t('common.yes') : t('common.no')}</DataTableTd>
                      <DataTableTd variant="page" align="right">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          size="sm"
                          aria-label={t('resources.delete')}
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }}
                        >
                          <IconTrash size={14} />
                        </ActionIcon>
                      </DataTableTd>
                    </DataTableBodyRow>
                  ))
                )}
              </tbody>
            </DataTable>
          </DataTableScroll>
          {totalPages > 1 && (
            <Group justify="center" p="md">
              <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
            </Group>
          )}
        </Card>
      )}

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
          } catch (err: unknown) {
            notifications.show({ message: apiErrorMessageForMutation(err, t, 'deleteResource.error'), color: 'red' })
          }
        }}
      />
    </Stack>
  )
}

export default ResourcesPage
