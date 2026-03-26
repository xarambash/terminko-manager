import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
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
    <Modal
      open={open}
      onClose={onClose}
      title={t('deleteService.title')}
      titleId="delete-service-modal-title"
    >
      <p className="text-sm text-[var(--text)]">{t('deleteService.body', { name: serviceName })}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button type="button" onClick={handleConfirm}>
          {t('deleteService.confirm')}
        </Button>
      </div>
    </Modal>
  )
}
