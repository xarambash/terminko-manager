import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { ActionIcon, Alert, Button, Group, Loader, Pagination, Stack, Table, Tooltip } from '@mantine/core'
import { IconAlertCircle, IconTrash } from '@tabler/icons-react'
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
} from '../components'
import { matchesTableSearch } from '../lib/tableSearch'
import { useDeleteResource, useResources } from '../hooks'
import { apiErrorMessageForMutation, formatQueryError } from '../lib/errors'
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
  const [hoveredId, setHoveredId] = useState<string | null>(null)
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

      <Card style={{ overflow: 'hidden' }}>
        <DataTableScroll variant="page" height="calc(100vh - 220px)">
          <DataTable variant="page" minWidth={320}>
            <thead>
              <DataTableHeadRow variant="page">
                <DataTableTh variant="page" sortable sortDirection={thDir('name')} onSort={() => handleSort('name')}>
                  {t('common.name')}
                </DataTableTh>
                <DataTableTh variant="page" sortable sortDirection={thDir('email')} onSort={() => handleSort('email')}>
                  {t('common.email')}
                </DataTableTh>
                <DataTableTh variant="page" sortable sortDirection={thDir('phone')} onSort={() => handleSort('phone')} className="mobile-hide">
                  {t('common.phone')}
                </DataTableTh>
                <DataTableTh variant="page" sortable sortDirection={thDir('active')} onSort={() => handleSort('active')} className="mobile-hide">
                  {t('common.active')}
                </DataTableTh>
                <DataTableTh variant="page" style={{ width: 56 }} />
              </DataTableHeadRow>
            </thead>
            <tbody>
              {isPending ? (
                <Table.Tr>
                  <DataTableEmptyCell variant="page" colSpan={5}>
                    <Loader size="sm" />
                  </DataTableEmptyCell>
                </Table.Tr>
              ) : isError ? (
                <Table.Tr>
                  <DataTableEmptyCell variant="page" colSpan={5}>
                    <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
                      {formatQueryError(error)}
                    </Alert>
                  </DataTableEmptyCell>
                </Table.Tr>
              ) : sorted.length === 0 ? (
                <Table.Tr><DataTableEmptyCell variant="page" colSpan={5}>{t('resources.empty')}</DataTableEmptyCell></Table.Tr>
              ) : filtered.length === 0 ? (
                <Table.Tr><DataTableEmptyCell variant="page" colSpan={5}>{t('common.emptySearch')}</DataTableEmptyCell></Table.Tr>
              ) : (
                paginated.map((r) => (
                  <DataTableBodyRow
                    key={r.id}
                    hoverable
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/resources/${r.id}`)}
                    onMouseEnter={() => setHoveredId(r.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <DataTableTd variant="page">{r.firstName} {r.lastName}</DataTableTd>
                    <DataTableTd variant="page">{r.email ?? t('common.dash')}</DataTableTd>
                    <DataTableTd variant="page" className="mobile-hide">{r.phone ?? t('common.dash')}</DataTableTd>
                    <DataTableTd variant="page" className="mobile-hide">{r.isActive ? t('common.yes') : t('common.no')}</DataTableTd>
                    <DataTableTd variant="page" align="right" style={{ width: 56 }}>
                      <Group gap={8} justify="flex-end" style={{ visibility: hoveredId === r.id ? 'visible' : 'hidden' }}>
                        <Tooltip label={t('resources.delete')} withArrow>
                          <ActionIcon
                            variant="outline"
                            color="red"
                            size="md"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }}
                            aria-label={t('resources.delete')}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </DataTableTd>
                  </DataTableBodyRow>
                ))
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
