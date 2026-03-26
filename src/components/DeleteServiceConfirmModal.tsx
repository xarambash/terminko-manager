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
import type { DeleteServiceConfirmModalProps } from '../types'

export function DeleteServiceConfirmModal({
  open,
  onClose,
  serviceName,
  onConfirm,
}: DeleteServiceConfirmModalProps) {
  const { t } = useTranslation()

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle id="delete-service-modal-title">{t('deleteService.title')}</DialogTitle>
          <DialogDescription>{t('deleteService.body', { name: serviceName })}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm}>
            {t('deleteService.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
