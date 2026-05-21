import { Modal, Text, Group, Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { CancelAppointmentConfirmModalProps } from '../types'

export function CancelAppointmentConfirmModal({
  open,
  onClose,
  guestName,
  serviceName,
  onConfirm,
  isPending,
}: CancelAppointmentConfirmModalProps) {
  const { t } = useTranslation()

  return (
    <Modal
      opened={open}
      onClose={() => { if (!isPending) onClose() }}
      title={t('cancelAppointment.title')}
      size="sm"
    >
      <Text size="sm" mb="lg">
        {t('cancelAppointment.body', { guestName, serviceName })}
      </Text>
      <Group justify="flex-end" gap="sm">
        <Button variant="default" onClick={onClose} disabled={isPending}>
          {t('common.cancel')}
        </Button>
        <Button color="red" onClick={onConfirm} disabled={isPending} loading={isPending}>
          {t('cancelAppointment.confirm')}
        </Button>
      </Group>
    </Modal>
  )
}
