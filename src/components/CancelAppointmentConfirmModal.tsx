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
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPending) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('cancelAppointment.title')}</DialogTitle>
          <DialogDescription>
            {t('cancelAppointment.body', { guestName, serviceName })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? t('cancelAppointment.canceling') : t('cancelAppointment.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
