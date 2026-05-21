import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import {
  Paper, Stack, Text, Button, Group, Modal, Select, TextInput, NumberInput, ActionIcon,
} from '@mantine/core'
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

  const resetForm = () => {
    setServiceId('')
    setPrice('')
    setDurationOverride('')
    setFormError(undefined)
    assignMutation.reset()
  }

  const onAssign = async () => {
    setFormError(undefined)
    if (!serviceId) { setFormError(t('resourceDetail.services.validationSelect')); return }
    if (assignedServiceIds.has(serviceId)) { setFormError(t('resourceDetail.services.validationDuplicate')); return }
    const priceNum = Number.parseFloat(price)
    if (Number.isNaN(priceNum) || priceNum < 0) { setFormError(t('resourceDetail.services.validationPrice')); return }
    let duration: number | undefined
    if (durationOverride.trim()) {
      const d = Number.parseInt(durationOverride, 10)
      if (Number.isNaN(d) || d <= 0) { setFormError(t('resourceDetail.services.validationDuration')); return }
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

  const serviceSelectData = tenantServicesOrdered.map((s) => ({
    value: s.id,
    label: `${s.name} (${t('common.minutes', { count: s.durationMinutes })})`,
    disabled: assignedServiceIds.has(s.id),
  }))

  return (
    <Paper withBorder shadow="xs" p="md">
      <Stack gap="md">
        <div>
          <Text fw={500} size="md" mb="xs">{t('resourceDetail.services.title')}</Text>
          <Text size="sm" c="dimmed">{t('resourceDetail.services.description')}</Text>
        </div>

        <QueryStatusBanner isPending={isPending} isError={isError} error={error} loadingText={t('loading.assignedServices')} />

        {!isPending && !isError && (
          <>
            <QueryStatusBanner isPending={servicesPending} isError={servicesError} error={servicesQueryError} loadingText={t('loading.tenantServices')} />

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
                    <tr><DataTableEmptyCell variant="inset" colSpan={4}>{t('resourceDetail.services.empty')}</DataTableEmptyCell></tr>
                  ) : (
                    (assignments ?? []).map((a) => (
                      <DataTableBodyRow key={a.id}>
                        <DataTableTd variant="inset">{a.service.name}</DataTableTd>
                        <DataTableTd variant="inset">{t('common.minutes', { count: a.durationOverride ?? a.service.durationMinutes })}</DataTableTd>
                        <DataTableTd variant="inset">{formatPrice(a.price)}</DataTableTd>
                        <DataTableTd variant="inset">
                          <Group gap="xs">
                            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => openEdit(a)}>
                              <IconPencil size={14} />
                            </ActionIcon>
                            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => setUnassignTarget(a)}>
                              <IconTrash size={14} />
                            </ActionIcon>
                          </Group>
                        </DataTableTd>
                      </DataTableBodyRow>
                    ))
                  )}
                </tbody>
              </DataTable>
            </DataTableScroll>

            {!servicesPending && !servicesError && tenantServicesOrdered.length > 0 && (
              <Stack gap="sm" pt="sm" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                <Text size="sm" fw={500}>
                  {(assignments ?? []).length === 0 ? t('resourceDetail.services.assignFirst') : t('resourceDetail.services.assignAnother')}
                </Text>
                <Text size="xs" c="dimmed">{t('resourceDetail.services.hint')}</Text>
                <Group align="flex-end" gap="sm" wrap="wrap">
                  <Select
                    label={t('common.service')}
                    data={serviceSelectData}
                    value={serviceId || null}
                    onChange={(v) => setServiceId(v ?? '')}
                    placeholder={t('common.selectPlaceholder')}
                    disabled={servicesPending}
                    miw={200}
                    searchable
                  />
                  <TextInput
                    label={t('common.price')}
                    inputMode="decimal"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder={t('resourceDetail.services.pricePlaceholder')}
                    w={120}
                  />
                  <NumberInput
                    label={t('resourceDetail.services.durationOverride')}
                    min={1}
                    value={durationOverride}
                    onChange={(v) => setDurationOverride(String(v))}
                    placeholder={t('resourceDetail.services.durationPlaceholder')}
                    w={120}
                  />
                  <Button
                    disabled={assignMutation.isPending || !serviceId || assignedServiceIds.has(serviceId)}
                    loading={assignMutation.isPending}
                    onClick={() => void onAssign()}
                    mb={1}
                  >
                    {t('common.assign')}
                  </Button>
                </Group>
                <FormError message={formError} />
              </Stack>
            )}
          </>
        )}
      </Stack>

      <Modal opened={editTarget !== null} onClose={closeEdit} title={t('resourceDetail.services.editTitle')} size="sm">
        {editTarget && (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              {t('resourceDetail.services.editDescription', { name: editTarget.service.name })}
            </Text>
            <TextInput
              label={t('common.price')}
              inputMode="decimal"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder={t('resourceDetail.services.pricePlaceholder')}
            />
            <NumberInput
              label={t('resourceDetail.services.durationOverride')}
              min={1}
              value={editDuration}
              onChange={(v) => setEditDuration(String(v))}
              placeholder={t('resourceDetail.services.durationPlaceholder')}
            />
            <FormError message={editError} />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={closeEdit} disabled={updateMutation.isPending}>{t('common.cancel')}</Button>
              <Button onClick={() => void onEdit()} loading={updateMutation.isPending}>{t('common.save')}</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal opened={unassignTarget !== null} onClose={closeUnassign} title={t('resourceDetail.services.unassignTitle')} size="sm">
        {unassignTarget && (
          <Stack gap="sm">
            <Text size="sm">
              {t('resourceDetail.services.unassignBody', { name: unassignTarget.service.name })}
            </Text>
            <FormError message={unassignError} />
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={closeUnassign} disabled={deleteMutation.isPending}>{t('common.cancel')}</Button>
              <Button color="red" onClick={() => void onUnassign()} loading={deleteMutation.isPending}>
                {t('resourceDetail.services.unassignConfirm')}
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Paper>
  )
}
