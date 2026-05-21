import { Modal, TextInput, NumberInput, Checkbox, Button, Group, Text, Stack } from '@mantine/core'
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
  sortOrder: number | ''
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
      sortOrder: '',
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
    if (data.sortOrder !== '') payload.sortOrder = Number(data.sortOrder)

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
        <Text size="sm" c="dimmed">{t('createService.intro')}</Text>
        <TextInput label={t('createService.name')} {...form.getInputProps('name')} />
        <NumberInput
          label={t('services.durationMinutes')}
          min={1}
          {...form.getInputProps('durationMinutes')}
        />
        <TextInput
          label={t('createService.descriptionOptional')}
          {...form.getInputProps('description')}
        />
        <NumberInput
          label={t('createService.sortOrderOptional')}
          min={0}
          {...form.getInputProps('sortOrder')}
        />
        <Checkbox
          label={t('createService.isActive')}
          {...form.getInputProps('isActive', { type: 'checkbox' })}
        />
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
