import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { notifications } from '@mantine/notifications'
import { ActionIcon, Alert, Button, Group, Loader, Pagination, Stack, Table, Text, Tooltip } from '@mantine/core'
import { IconAlertCircle, IconPencil, IconTrash } from '@tabler/icons-react'
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
} from '../components'
import { matchesTableSearch } from '../lib/tableSearch'
import { useDeleteService, useServices } from '../hooks'
import { apiErrorMessageForMutation, formatQueryError } from '../lib/errors'
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
  const [hoveredId, setHoveredId] = useState<string | null>(null)
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

  function thDir(field: SortField): 'asc' | 'desc' | null {
    return sortField === field ? (sortAsc ? 'asc' : 'desc') : null
  }

  return (
    <Stack component="main" maw="1500px" mx="auto" w="100%" gap="lg">
      <Stack gap="sm">
        <PageSectionHeader title={t('services.title')} />
        <PageSearchBar
          id="services-search"
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          actions={<Button onClick={() => setCreateOpen(true)}>{t('services.createService')}</Button>}
        />
      </Stack>

      <Card style={{ overflow: 'hidden' }}>
        <DataTableScroll variant="page" height="calc(100vh - 220px)">
          <DataTable variant="page" minWidth={880}>
            <thead>
              <DataTableHeadRow variant="page">
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
                <DataTableTh variant="page" style={{ width: 88 }} />
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
                <Table.Tr><DataTableEmptyCell variant="page" colSpan={5}>{t('services.empty')}</DataTableEmptyCell></Table.Tr>
              ) : filtered.length === 0 ? (
                <Table.Tr><DataTableEmptyCell variant="page" colSpan={5}>{t('common.emptySearch')}</DataTableEmptyCell></Table.Tr>
              ) : (
                paginated.map((s) => (
                  <DataTableBodyRow
                    key={s.id}
                    hoverable
                    onMouseEnter={() => setHoveredId(s.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <DataTableTd variant="page">{s.name}</DataTableTd>
                    <DataTableTd variant="page">{t('common.minutes', { count: s.durationMinutes })}</DataTableTd>
                    <DataTableTd variant="page" style={{ maxWidth: 220 }}>
                      <Text truncate="end">{s.description ?? t('common.dash')}</Text>
                    </DataTableTd>
                    <DataTableTd variant="page">{s.isActive ? t('common.yes') : t('common.no')}</DataTableTd>
                    <DataTableTd variant="page" align="right" style={{ width: 88 }}>
                      <Group gap={8} justify="flex-end" style={{ visibility: hoveredId === s.id ? 'visible' : 'hidden' }}>
                        <Tooltip label={t('services.edit')} withArrow>
                          <ActionIcon
                            variant="outline"
                            color="gray"
                            size="md"
                            onClick={(e) => { e.stopPropagation(); setEditService(s) }}
                            aria-label={t('services.edit')}
                          >
                            <IconPencil size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label={t('common.delete')} withArrow>
                          <ActionIcon
                            variant="outline"
                            color="red"
                            size="md"
                            onClick={(e) => { e.stopPropagation(); setDeleteService(s) }}
                            aria-label={t('common.delete')}
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

      <CreateServiceModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditServiceModal
        open={editService != null}
        onClose={() => setEditService(null)}
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
          } catch (err: unknown) {
            notifications.show({ message: apiErrorMessageForMutation(err, t, 'deleteService.error'), color: 'red' })
          }
        }}
      />
    </Stack>
  )
}

export default ServicesPage
