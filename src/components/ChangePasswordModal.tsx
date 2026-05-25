import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Stack, PasswordInput, Button, Group } from '@mantine/core'
import { useForm } from '@mantine/form'
import { notifications } from '@mantine/notifications'
import { useChangePassword } from '../hooks'
import { extractServerError } from '../lib/errors'
import { FormError } from './ui/FormError'
import type { ChangePasswordModalProps } from '../types'

function ChangePasswordFormContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const mutation = useChangePassword()
  const [formError, setFormError] = useState<string | undefined>()

  const form = useForm({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      currentPassword: (v) => (v.trim() ? null : t('changePassword.validation.currentPassword')),
      newPassword: (v) =>
        v.length >= 8 ? null : t('changePassword.validation.newPassword'),
      confirmPassword: (v, values) =>
        v === values.newPassword ? null : t('changePassword.validation.confirmPassword'),
    },
  })

  const closeModal = () => {
    form.reset()
    mutation.reset()
    setFormError(undefined)
    onClose()
  }

  const onSubmit = form.onSubmit(async (values) => {
    setFormError(undefined)
    try {
      await mutation.mutateAsync({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      notifications.show({ color: 'green', message: t('changePassword.success') })
      closeModal()
    } catch (err: unknown) {
      setFormError(extractServerError(err) ?? t('changePassword.error'))
    }
  })

  return (
    <form onSubmit={onSubmit}>
      <Stack gap="sm">
        <PasswordInput
          label={t('changePassword.currentPassword')}
          autoComplete="current-password"
          {...form.getInputProps('currentPassword')}
        />
        <PasswordInput
          label={t('changePassword.newPassword')}
          autoComplete="new-password"
          {...form.getInputProps('newPassword')}
        />
        <PasswordInput
          label={t('changePassword.confirmPassword')}
          autoComplete="new-password"
          {...form.getInputProps('confirmPassword')}
        />
        <FormError message={formError} />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={closeModal}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {t('changePassword.submit')}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const { t, i18n } = useTranslation()

  return (
    <Modal opened={open} onClose={onClose} title={t('changePassword.title')} size="sm">
      <ChangePasswordFormContent key={i18n.language} onClose={onClose} />
    </Modal>
  )
}
