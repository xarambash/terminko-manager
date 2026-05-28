import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { ActionIcon, Alert, Badge, Button, Group, Loader, Pagination, Paper, Stack, Table, Text, Tooltip } from '@mantine/core'
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
  const isMobile = useMediaQuery('(max-width: 768px)')
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

      {isPending && <Group justify="center"><Loader size="sm" /></Group>}
      {isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {formatQueryError(error)}
        </Alert>
      )}
      {!isPending && !isError && (
        isMobile ? (
          <Stack gap="sm">
            {sorted.length === 0 && <Text c="dimmed" size="sm">{t('resources.empty')}</Text>}
            {sorted.length > 0 && filtered.length === 0 && <Text c="dimmed" size="sm">{t('common.emptySearch')}</Text>}
            {paginated.map((r) => (
              <Paper
                key={r.id}
                withBorder
                p="md"
                radius="md"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/resources/${r.id}`)}
              >
                <Group justify="space-between" mb={4}>
                  <Text fw={500}>{r.firstName} {r.lastName}</Text>
                  <Badge color={r.isActive ? 'green' : 'gray'} variant="light" size="sm">
                    {r.isActive ? t('common.active') : t('common.inactive')}
                  </Badge>
                </Group>
                <Text size="sm" c="dimmed">{r.email ?? t('common.dash')}</Text>
                {r.phone && <Text size="sm" c="dimmed">{r.phone}</Text>}
                <Group justify="flex-end" mt="sm">
                  <ActionIcon
                    variant="outline"
                    color="red"
                    size="md"
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }}
                    aria-label={t('resources.delete')}
                  >
                    <IconTrash size={14} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}
            {totalPages > 1 && (
              <Group justify="center">
                <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
              </Group>
            )}
          </Stack>
        ) : (
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
                    <DataTableTh variant="page" sortable sortDirection={thDir('phone')} onSort={() => handleSort('phone')}>
                      {t('common.phone')}
                    </DataTableTh>
                    <DataTableTh variant="page" sortable sortDirection={thDir('active')} onSort={() => handleSort('active')}>
                      {t('common.active')}
                    </DataTableTh>
                    <DataTableTh variant="page" style={{ width: 56 }} />
                  </DataTableHeadRow>
                </thead>
                <tbody>
                  {sorted.length === 0 ? (
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
                        <DataTableTd variant="page">{r.phone ?? t('common.dash')}</DataTableTd>
                        <DataTableTd variant="page">{r.isActive ? t('common.yes') : t('common.no')}</DataTableTd>
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
            {totalPages > 1 && (
              <Group justify="center" p="md">
                <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
              </Group>
            )}
          </Card>
        )
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
