import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  PageSectionHeader,
  QueryStatusBanner,
} from '../components'
import { useServices } from '../hooks'
import type { Service } from '../types'

const pageClass = 'flex flex-1 flex-col gap-4 p-4 text-left sm:gap-6 sm:p-6 md:gap-8 md:p-8'

function ServicesPage() {
  const { t } = useTranslation()
  const { data: services, isPending, isError, error } = useServices()
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

  return (
    <main className={pageClass}>
      <PageSectionHeader
        title={t('services.title')}
        actions={
          <Button type="button" onClick={() => setCreateOpen(true)}>
            {t('services.createService')}
          </Button>
        }
      />

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
                  <DataTableTh variant="page">{t('services.sortOrder')}</DataTableTh>
                  <DataTableTh variant="page" align="right">
                    {t('common.actions')}
                  </DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="page" colSpan={6}>
                      {t('services.empty')}
                    </DataTableEmptyCell>
                  </tr>
                ) : (
                  sorted.map((s) => (
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
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {s.sortOrder}
                      </DataTableTd>
                      <DataTableTd variant="page" align="right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => setEditService(s)}
                          >
                            {t('services.edit')}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => setDeleteService(s)}
                          >
                            {t('services.delete')}
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
        onConfirm={() => {}}
      />
    </main>
  )
}

export default ServicesPage
