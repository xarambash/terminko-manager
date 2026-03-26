import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import {
  DataTable,
  DataTableBodyRow,
  DataTableEmptyCell,
  DataTableHeadRow,
  DataTableScroll,
  DataTableTd,
  DataTableTh,
} from '../ui/DataTable'
import { FormError } from '../ui/FormError'
import { FormField } from '../ui/FormField'
import { QueryStatusBanner } from '../ui/QueryStatusBanner'
import {
  useAssignResourceService,
  useResourceServices,
  useServices,
} from '../../hooks'
import { extractServerError } from '../../lib/errors'
import { formatPrice, inputSelectClass } from '../../lib/resourceDetailUtils'

export function ResourceServicesSection({ resourceId }: { resourceId: string }) {
  const { t } = useTranslation()
  const { data: assignments, isPending, isError, error } = useResourceServices(resourceId)
  const {
    data: allServices,
    isPending: servicesPending,
    isError: servicesError,
    error: servicesQueryError,
  } = useServices()
  const assignMutation = useAssignResourceService(resourceId)

  const [serviceId, setServiceId] = useState('')
  const [price, setPrice] = useState('')
  const [durationOverride, setDurationOverride] = useState('')
  const [formError, setFormError] = useState<string | undefined>()

  const tenantServicesOrdered = useMemo(() => {
    const list = [...(allServices ?? [])]
    list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return a.name.localeCompare(b.name)
    })
    return list
  }, [allServices])

  const assignedServiceIds = useMemo(
    () => new Set((assignments ?? []).map((a) => a.serviceId)),
    [assignments]
  )

  const resetForm = () => {
    setServiceId('')
    setPrice('')
    setDurationOverride('')
    setFormError(undefined)
    assignMutation.reset()
  }

  const onAssign = async () => {
    setFormError(undefined)
    if (!serviceId) {
      setFormError(t('resourceDetail.services.validationSelect'))
      return
    }
    if (assignedServiceIds.has(serviceId)) {
      setFormError(t('resourceDetail.services.validationDuplicate'))
      return
    }
    const priceNum = Number.parseFloat(price)
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setFormError(t('resourceDetail.services.validationPrice'))
      return
    }
    let duration: number | undefined
    if (durationOverride.trim()) {
      const d = Number.parseInt(durationOverride, 10)
      if (Number.isNaN(d) || d <= 0) {
        setFormError(t('resourceDetail.services.validationDuration'))
        return
      }
      duration = d
    }
    try {
      await assignMutation.mutateAsync({
        serviceId,
        price: priceNum,
        ...(duration != null ? { durationOverride: duration } : {}),
      })
      resetForm()
    } catch (err: unknown) {
      setFormError(extractServerError(err) ?? t('resourceDetail.services.errorAssign'))
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-6">
      <h2 className="text-lg font-medium text-[var(--text-h)]">{t('resourceDetail.services.title')}</h2>
      <p className="text-sm text-[var(--text)]">{t('resourceDetail.services.description')}</p>

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText={t('loading.assignedServices')}
      />

      {!isPending && !isError && (
        <>
          <QueryStatusBanner
            isPending={servicesPending}
            isError={servicesError}
            error={servicesQueryError}
            loadingText={t('loading.tenantServices')}
          />

          <DataTableScroll variant="inset">
            <DataTable variant="inset" minWidth={480}>
              <thead>
                <DataTableHeadRow variant="inset">
                  <DataTableTh variant="inset">{t('common.service')}</DataTableTh>
                  <DataTableTh variant="inset">{t('common.duration')}</DataTableTh>
                  <DataTableTh variant="inset">{t('common.price')}</DataTableTh>
                  <DataTableTh variant="inset">{t('common.active')}</DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {(assignments ?? []).length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="inset" colSpan={4}>
                      {t('resourceDetail.services.empty')}
                    </DataTableEmptyCell>
                  </tr>
                ) : (
                  (assignments ?? []).map((a) => (
                    <DataTableBodyRow key={a.id}>
                      <DataTableTd variant="inset" className="text-[var(--text-h)]">
                        {a.service.name}
                      </DataTableTd>
                      <DataTableTd variant="inset" className="text-[var(--text)]">
                        {t('common.minutes', {
                          count: a.durationOverride ?? a.service.durationMinutes,
                        })}
                      </DataTableTd>
                      <DataTableTd variant="inset" className="text-[var(--text)]">
                        {formatPrice(a.price)}
                      </DataTableTd>
                      <DataTableTd variant="inset" className="text-[var(--text)]">
                        {a.isActive ? t('common.yes') : t('common.no')}
                      </DataTableTd>
                    </DataTableBodyRow>
                  ))
                )}
              </tbody>
            </DataTable>
          </DataTableScroll>

          {!servicesPending && !servicesError && tenantServicesOrdered.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
              <p className="text-sm font-medium text-[var(--text-h)]">
                {(assignments ?? []).length === 0
                  ? t('resourceDetail.services.assignFirst')
                  : t('resourceDetail.services.assignAnother')}
              </p>
              <p className="text-xs text-[var(--text)]">{t('resourceDetail.services.hint')}</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="assign-service" className="mb-1 block text-sm text-[var(--text)]">
                    {t('common.service')}
                  </label>
                  <select
                    id="assign-service"
                    className={inputSelectClass}
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                  >
                    <option value="">{t('common.selectPlaceholder')}</option>
                    {tenantServicesOrdered.map((s) => {
                      const taken = assignedServiceIds.has(s.id)
                      return (
                        <option key={s.id} value={s.id} disabled={taken}>
                          {s.name} ({t('common.minutes', { count: s.durationMinutes })})
                          {taken ? t('resourceDetail.services.optionAssigned') : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <FormField
                  label={t('common.price')}
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={t('resourceDetail.services.pricePlaceholder')}
                />
                <FormField
                  label={t('resourceDetail.services.durationOverride')}
                  type="number"
                  min={1}
                  value={durationOverride}
                  onChange={(e) => setDurationOverride(e.target.value)}
                  placeholder={t('resourceDetail.services.durationPlaceholder')}
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    disabled={
                      assignMutation.isPending ||
                      !serviceId ||
                      assignedServiceIds.has(serviceId)
                    }
                    onClick={() => void onAssign()}
                  >
                    {assignMutation.isPending ? t('common.assigning') : t('common.assign')}
                  </Button>
                </div>
              </div>
              <FormError message={formError} />
            </div>
          ) : !servicesPending && !servicesError ? (
            <p className="text-sm text-[var(--text)]">
              {tenantServicesOrdered.length === 0 ? t('resourceDetail.services.noTenantServices') : null}
            </p>
          ) : null}
        </>
      )}
    </Card>
  )
}
