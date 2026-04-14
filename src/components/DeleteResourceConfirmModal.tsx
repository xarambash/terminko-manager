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
import type { DeleteResourceConfirmModalProps } from '../types'

export function DeleteResourceConfirmModal({
  open,
  onClose,
  resourceName,
  onConfirm,
  isPending,
}: DeleteResourceConfirmModalProps) {
  const { t } = useTranslation()

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPending) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('deleteResource.title')}</DialogTitle>
          <DialogDescription>{t('deleteResource.body', { name: resourceName })}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? t('common.deleting') : t('deleteResource.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
