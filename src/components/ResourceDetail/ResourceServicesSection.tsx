import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDownIcon, Pencil, Trash2 } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { FormError } from '../ui/FormError'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { FormField } from '../ui/FormField'
import { QueryStatusBanner } from '../ui/QueryStatusBanner'
import {
  useAssignResourceService,
  useDeleteResourceService,
  useResourceServices,
  useServices,
  useUpdateResourceService,
} from '../../hooks'
import { extractServerError } from '../../lib/errors'
import { formatPrice } from '../../lib/resourceDetailUtils'
import type { ResourceServiceAssignment } from '../../types'

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
  const updateMutation = useUpdateResourceService(resourceId)
  const deleteMutation = useDeleteResourceService(resourceId)

  const [serviceId, setServiceId] = useState('')
  const [price, setPrice] = useState('')
  const [durationOverride, setDurationOverride] = useState('')
  const [formError, setFormError] = useState<string | undefined>()

  const [editTarget, setEditTarget] = useState<ResourceServiceAssignment | null>(null)
  const [editPrice, setEditPrice] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editError, setEditError] = useState<string | undefined>()

  const [unassignTarget, setUnassignTarget] = useState<ResourceServiceAssignment | null>(null)
  const [unassignError, setUnassignError] = useState<string | undefined>()

  const openEdit = (a: ResourceServiceAssignment) => {
    setEditTarget(a)
    setEditPrice(String(a.price))
    setEditDuration(a.durationOverride != null ? String(a.durationOverride) : '')
    setEditError(undefined)
    updateMutation.reset()
  }

  const closeEdit = () => {
    setEditTarget(null)
    setEditError(undefined)
    updateMutation.reset()
  }

  const onEdit = async () => {
    if (!editTarget) return
    setEditError(undefined)
    const priceNum = Number.parseFloat(editPrice)
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setEditError(t('resourceDetail.services.validationPrice'))
      return
    }
    let duration: number | null = null
    if (editDuration.trim()) {
      const d = Number.parseInt(editDuration, 10)
      if (Number.isNaN(d) || d <= 0) {
        setEditError(t('resourceDetail.services.validationDuration'))
        return
      }
      duration = d
    }
    try {
      await updateMutation.mutateAsync({
        resourceServiceId: editTarget.id,
        body: { price: priceNum, durationOverride: duration },
      })
      closeEdit()
    } catch (err: unknown) {
      setEditError(extractServerError(err) ?? t('resourceDetail.services.errorEdit'))
    }
  }

  const openUnassign = (a: ResourceServiceAssignment) => {
    setUnassignTarget(a)
    setUnassignError(undefined)
    deleteMutation.reset()
  }

  const closeUnassign = () => {
    if (deleteMutation.isPending) return
    setUnassignTarget(null)
    setUnassignError(undefined)
    deleteMutation.reset()
  }

  const onUnassign = async () => {
    if (!unassignTarget) return
    setUnassignError(undefined)
    try {
      await deleteMutation.mutateAsync(unassignTarget.id)
      setUnassignTarget(null)
    } catch (err: unknown) {
      setUnassignError(extractServerError(err) ?? t('resourceDetail.services.errorUnassign'))
    }
  }

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

  const selectedService = useMemo(() => {
    if (!serviceId) return undefined
    return tenantServicesOrdered.find((s) => s.id === serviceId)
  }, [serviceId, tenantServicesOrdered])

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
            <DataTable variant="inset" minWidth={520}>
              <thead>
                <DataTableHeadRow variant="inset">
                  <DataTableTh variant="inset">{t('common.service')}</DataTableTh>
                  <DataTableTh variant="inset">{t('common.duration')}</DataTableTh>
                  <DataTableTh variant="inset">{t('common.price')}</DataTableTh>
                  <DataTableTh variant="inset">{t('common.actions')}</DataTableTh>
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
                      <DataTableTd variant="inset">
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openEdit(a)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => openUnassign(a)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
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
                  <div id="assign-service-label" className="mb-1 block text-sm text-[var(--text)]">
                    {t('common.service')}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        aria-labelledby="assign-service-label"
                        disabled={servicesPending || tenantServicesOrdered.length === 0}
                        className="w-full justify-between font-normal"
                      >
                        <span className="truncate text-left">
                          {selectedService
                            ? `${selectedService.name} (${t('common.minutes', { count: selectedService.durationMinutes })})`
                            : t('common.selectPlaceholder')}
                        </span>
                        <ChevronDownIcon className="size-4 shrink-0 opacity-60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="max-h-72 min-w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
                    >
                      <DropdownMenuItem onSelect={() => setServiceId('')}>
                        {t('common.selectPlaceholder')}
                      </DropdownMenuItem>
                      {tenantServicesOrdered.map((s) => {
                        const taken = assignedServiceIds.has(s.id)
                        return (
                          <DropdownMenuItem
                            key={s.id}
                            disabled={taken}
                            onSelect={() => setServiceId(s.id)}
                          >
                            {s.name} ({t('common.minutes', { count: s.durationMinutes })})
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      <Dialog open={editTarget !== null} onOpenChange={(next) => { if (!next) closeEdit() }}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t('resourceDetail.services.editTitle')}</DialogTitle>
            {editTarget && (
              <DialogDescription>
                {t('resourceDetail.services.editDescription', { name: editTarget.service.name })}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <FormField
              label={t('common.price')}
              type="text"
              inputMode="decimal"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder={t('resourceDetail.services.pricePlaceholder')}
            />
            <FormField
              label={t('resourceDetail.services.durationOverride')}
              type="number"
              min={1}
              value={editDuration}
              onChange={(e) => setEditDuration(e.target.value)}
              placeholder={t('resourceDetail.services.durationPlaceholder')}
            />
            <FormError message={editError} />
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeEdit} disabled={updateMutation.isPending}>
              {t('common.cancel')}
            </Button>
            <Button type="button" onClick={() => void onEdit()} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={unassignTarget !== null} onOpenChange={(next) => { if (!next) closeUnassign() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('resourceDetail.services.unassignTitle')}</DialogTitle>
            {unassignTarget && (
              <DialogDescription>
                {t('resourceDetail.services.unassignBody', { name: unassignTarget.service.name })}
              </DialogDescription>
            )}
          </DialogHeader>
          <FormError message={unassignError} />
          <DialogFooter className="gap-2 sm:justify-end">
            <Button type="button" variant="secondary" onClick={closeUnassign} disabled={deleteMutation.isPending}>
              {t('common.cancel')}
            </Button>
            <Button type="button" variant="destructive" onClick={() => void onUnassign()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? t('resourceDetail.services.unassigning') : t('resourceDetail.services.unassignConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
