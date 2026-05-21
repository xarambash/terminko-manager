import { Modal, Text, Group, Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { GuestActionPlaceholderModalProps } from '../types'

export function GuestActionPlaceholderModal({
  open,
  onClose,
  guestName,
  action,
}: GuestActionPlaceholderModalProps) {
  const { t } = useTranslation()
  const isBan = action === 'ban'

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={isBan ? t('guests.ban.title') : t('guests.unban.title')}
      size="sm"
    >
      <Text size="sm" mb="lg">
        {isBan
          ? t('guests.ban.body', { name: guestName })
          : t('guests.unban.body', { name: guestName })}
      </Text>
      <Group justify="flex-end">
        <Button onClick={onClose}>{t('guests.placeholderClose')}</Button>
      </Group>
    </Modal>
  )
}
