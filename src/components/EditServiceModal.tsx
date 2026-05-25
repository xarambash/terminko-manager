import { Modal, TextInput, NumberInput, Switch, Button, Group, Text, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { useUpdateService } from '../hooks'
import { apiErrorMessageForMutation } from '../lib/errors'
import type { EditServiceModalProps } from '../types'
import type { UpdateServicePayload } from '../types/services'

type EditServiceForm = {
  name: string
  durationMinutes: number | ''
  description: string
  isActive: boolean
}

function EditServiceFormContent({
  service,
  onClose,
}: {
  service: NonNullable<EditServiceModalProps['service']>
  onClose: () => void
}) {
  const { t } = useTranslation()
  const updateMutation = useUpdateService()

  const form = useForm<EditServiceForm>({
    initialValues: {
      name: service.name,
      durationMinutes: service.durationMinutes,
      description: service.description ?? '',
      isActive: service.isActive,
    },
    validate: {
      name: (v) => (!v.trim() ? t('createService.validation.name') : null),
      durationMinutes: (v) =>
        !v || Number(v) <= 0 ? t('createService.validation.duration') : null,
    },
  })

  const handleClose = () => {
    form.reset()
    updateMutation.reset()
    onClose()
  }

  const onSubmit = form.onSubmit(async (data) => {
    const payload: UpdateServicePayload = {
      name: data.name.trim(),
      durationMinutes: Number(data.durationMinutes),
      isActive: data.isActive,
      description: data.description?.trim() || null,
    }

    try {
      await updateMutation.mutateAsync({ serviceId: service.id, body: payload })
      handleClose()
    } catch (err: unknown) {
      form.setErrors({ name: apiErrorMessageForMutation(err, t, 'editService.errorSave') })
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="sm">
        <TextInput
          label={t('createService.serviceName')}
          withAsterisk
          {...form.getInputProps('name')}
        />
        <NumberInput
          label={t('createService.serviceDuration')}
          withAsterisk
          min={1}
          hideControls
          {...form.getInputProps('durationMinutes')}
        />
        <TextInput
          label={t('createService.serviceDescription')}
          {...form.getInputProps('description')}
        />
        <Group justify="space-between" align="center">
          <Text size="sm">{t('createService.isActive')}</Text>
          <Switch
            checked={form.values.isActive}
            onChange={(e) => form.setFieldValue('isActive', e.currentTarget.checked)}
          />
        </Group>
        <Group justify="flex-end" gap="sm" mt="xs">
          <Button variant="default" onClick={handleClose} disabled={form.submitting}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={form.submitting}>{t('editService.save')}</Button>
        </Group>
      </Stack>
    </form>
  )
}

export function EditServiceModal({ open, onClose, service }: EditServiceModalProps) {
  const { t, i18n } = useTranslation()

  if (!service) return null

  return (
    <Modal opened={open} onClose={onClose} title={t('editService.title')} size="sm">
      <EditServiceFormContent key={`${service.id}-${i18n.language}`} service={service} onClose={onClose} />
    </Modal>
  )
}
