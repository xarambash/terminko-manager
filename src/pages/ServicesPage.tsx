import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Pencil, Trash2 } from 'lucide-react'
import {
  Button,
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
  ListSearchField,
  PageSectionHeader,
  QueryStatusBanner,
} from '../components'
import { matchesTableSearch } from '../lib/tableSearch'
import { useDeleteService, useServices } from '../hooks'
import { apiErrorMessageForMutation } from '../lib/errors'
import type { Service } from '../types'

const pageClass = 'flex flex-1 flex-col gap-4 p-4 text-left sm:gap-6 sm:p-6 md:gap-8 md:p-8'

function ServicesPage() {
  const { t } = useTranslation()
  const { data: services, isPending, isError, error } = useServices()
  const deleteMutation = useDeleteService()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)
  const [deleteService, setDeleteService] = useState<Service | null>(null)

  const sorted = useMemo(() => {
    const list = [...(services ?? [])]
    list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return a.name.localeCompare(b.name)
    })
    return list
  }, [services])

  const filtered = useMemo(
    () =>
      sorted.filter((s) =>
        matchesTableSearch(search, [s.name, s.description ?? '', s.durationMinutes, s.sortOrder])
      ),
    [sorted, search]
  )

  return (
    <main className={pageClass}>
      <div className="flex flex-col gap-4">
        <PageSectionHeader
          title={t('services.title')}
          actions={
            <Button type="button" onClick={() => setCreateOpen(true)}>
              {t('services.createService')}
            </Button>
          }
        />
        <ListSearchField
          id="services-search"
          value={search}
          onChange={setSearch}
        />
      </div>

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText={t('loading.services')}
      />

      {!isPending && !isError && (
        <Card className="overflow-hidden p-0">
          <DataTableScroll variant="page">
            <DataTable variant="page" minWidth={880}>
              <thead>
                <DataTableHeadRow variant="page">
                  <DataTableTh variant="page">{t('common.name')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.duration')}</DataTableTh>
                  <DataTableTh variant="page">{t('services.description')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.active')}</DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="page" colSpan={6}>
                      {t('services.empty')}
                    </DataTableEmptyCell>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="page" colSpan={6}>
                      {t('common.emptySearch')}
                    </DataTableEmptyCell>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <DataTableBodyRow key={s.id}>
                      <DataTableTd variant="page" className="text-[var(--text-h)]">
                        {s.name}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {t('common.minutes', { count: s.durationMinutes })}
                      </DataTableTd>
                      <DataTableTd variant="page" className="max-w-[220px] truncate text-[var(--text)]">
                        {s.description ?? t('common.dash')}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {s.isActive ? t('common.yes') : t('common.no')}
                      </DataTableTd>
                      <DataTableTd variant="page" align="right">
                        <div className="flex justify-end gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            aria-label={t('services.edit')}
                            title={t('services.edit')}
                            onClick={() => setEditService(s)}
                          >
                            <Pencil aria-hidden />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            aria-label={t('services.delete')}
                            title={t('services.delete')}
                            onClick={() => setDeleteService(s)}
                          >
                            <Trash2 aria-hidden />
                          </Button>
                        </div>
                      </DataTableTd>
                    </DataTableBodyRow>
                  ))
                )}
              </tbody>
            </DataTable>
          </DataTableScroll>
        </Card>
      )}

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
            toast.error(apiErrorMessageForMutation(err, t, 'deleteService.error'))
          }
        }}
      />
    </main>
  )
}

export default ServicesPage
