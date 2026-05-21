import { Modal, Text, Group, Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { DeleteResourceConfirmModalProps } from '../types'

export function DeleteResourceConfirmModal({
  open,
  onClose,
  resourceName,
  onConfirm,
  isPending,
}: DeleteResourceConfirmModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      opened={open}
      onClose={() => { if (!isPending) onClose() }}
      title={t('deleteResource.title')}
      size="sm"
    >
      <Text size="sm" mb="lg">
        {t('deleteResource.body', { name: resourceName })}
      </Text>
      <Group justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose} disabled={isPending}>
          {t('common.cancel')}
        </Button>
        <Button color="red" onClick={onConfirm} disabled={isPending} loading={isPending}>
          {t('deleteResource.confirm')}
        </Button>
      </Group>
    </Modal>
  )
}
