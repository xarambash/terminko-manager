import { Modal, Text, Group, Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { DeleteServiceConfirmModalProps } from '../types'

export function DeleteServiceConfirmModal({
  open,
  onClose,
  serviceName,
  onConfirm,
  isPending,
}: DeleteServiceConfirmModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      opened={open}
      onClose={() => { if (!isPending) onClose() }}
      title={t('deleteService.title')}
      size="sm"
    >
      <Text size="sm" mb="lg">
        {t('deleteService.body', { name: serviceName })}
      </Text>
      <Group justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose} disabled={isPending}>
          {t('common.cancel')}
        </Button>
        <Button color="red" onClick={onConfirm} disabled={isPending} loading={isPending}>
          {t('deleteService.confirm')}
        </Button>
      </Group>
    </Modal>
  )
}
