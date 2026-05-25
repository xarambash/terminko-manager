import { Modal, TextInput, PasswordInput, Button, Group, Text, Stack } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { useCreateResource } from '../hooks'
import { extractServerError } from '../lib/errors'
import type { CreateResourceModalProps } from '../types'

type CreateResourceForm = {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
}

function CreateResourceFormContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const createMutation = useCreateResource()

  const form = useForm<CreateResourceForm>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
    },
    validate: {
      firstName: (v) => (!v.trim() ? t('createResource.validation.firstName') : null),
      lastName: (v) => (!v.trim() ? t('createResource.validation.lastName') : null),
      email: (v) => {
        if (!v.trim()) return t('createResource.validation.emailRequired')
        if (!/^\S+@\S+\.\S+$/.test(v)) return t('createResource.validation.invalidEmail')
        return null
      },
      password: (v) => (v.length < 8 ? t('createResource.validation.password') : null),
    },
  })

  const handleClose = () => {
    form.reset()
    createMutation.reset()
    onClose()
  }

  const onSubmit = form.onSubmit(async (data) => {
    try {
      await createMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        ...(data.phone?.trim() && { phone: data.phone.trim() }),
      })
      handleClose()
    } catch (err: unknown) {
      form.setErrors({ firstName: extractServerError(err) ?? t('createResource.errorCreate') })
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="sm">
        <TextInput
          label={t('common.firstName')}
          withAsterisk
          {...form.getInputProps('firstName')}
        />
        <TextInput
          label={t('common.lastName')}
          withAsterisk
          {...form.getInputProps('lastName')}
        />
        <TextInput
          label={t('common.email')}
          withAsterisk
          type="email"
          autoComplete="off"
          {...form.getInputProps('email')}
        />
        <PasswordInput
          label={t('common.password')}
          withAsterisk
          autoComplete="new-password"
          {...form.getInputProps('password')}
        />
        <TextInput label={t('createResource.phone')} {...form.getInputProps('phone')} />
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

export function CreateResourceModal({ open, onClose }: CreateResourceModalProps) {
  const { t, i18n } = useTranslation()

  return (
    <Modal opened={open} onClose={onClose} title={t('createResource.title')} size="sm">
      <CreateResourceFormContent key={i18n.language} onClose={onClose} />
    </Modal>
  )
}
