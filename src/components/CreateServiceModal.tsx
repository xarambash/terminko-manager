import { Modal, TextInput, NumberInput, Switch, Button, Group, Text, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { useCreateService } from '../hooks'
import { extractServerError } from '../lib/errors'
import type { CreateServiceModalProps } from '../types'
import type { CreateServicePayload } from '../types/services'

type CreateServiceForm = {
  name: string
  durationMinutes: number | ''
  description: string
  isActive: boolean
}

function CreateServiceFormContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const createMutation = useCreateService()

  const form = useForm<CreateServiceForm>({
    initialValues: {
      name: '',
      durationMinutes: 30,
      description: '',
      isActive: true,
    },
    validate: {
      name: (v) => (!v.trim() ? t('createService.validation.name') : null),
      durationMinutes: (v) =>
        !v || Number(v) <= 0 ? t('createService.validation.duration') : null,
    },
  })

  const handleClose = () => {
    form.reset()
    createMutation.reset()
    onClose()
  }

  const onSubmit = form.onSubmit(async (data) => {
    const payload: CreateServicePayload = {
      name: data.name.trim(),
      durationMinutes: Number(data.durationMinutes),
      isActive: data.isActive,
    }
    if (data.description?.trim()) payload.description = data.description.trim()

    try {
      await createMutation.mutateAsync(payload)
      handleClose()
    } catch (err: unknown) {
      form.setErrors({ name: extractServerError(err) ?? t('createService.errorCreate') })
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
        {createMutation.isError && (
          <Text size="sm" c="red">{extractServerError(createMutation.error)}</Text>
        )}
        <Group justify="flex-end" gap="sm" mt="xs">
          <Button variant="default" onClick={handleClose}>{t('common.cancel')}</Button>
          <Button type="submit" loading={form.submitting}>{t('common.create')}</Button>
        </Group>
      </Stack>
    </form>
  )
}

export function CreateServiceModal({ open, onClose }: CreateServiceModalProps) {
  const { t, i18n } = useTranslation()

  return (
    <Modal opened={open} onClose={onClose} title={t('createService.title')} size="sm">
      <CreateServiceFormContent key={i18n.language} onClose={onClose} />
    </Modal>
  )
}
