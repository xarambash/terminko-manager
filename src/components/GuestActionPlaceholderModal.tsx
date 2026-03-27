import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle id="guest-action-modal-title">
            {isBan ? t('guests.ban.title') : t('guests.unban.title')}
          </DialogTitle>
          <DialogDescription>
            {isBan
              ? t('guests.ban.body', { name: guestName })
              : t('guests.unban.body', { name: guestName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" onClick={onClose}>
            {t('guests.placeholderClose')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
