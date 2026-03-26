import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'
import { FormField } from './ui/FormField'
import { Modal } from './ui/Modal'
import type { EditServiceModalProps } from '../types'

export function EditServiceModal({ open, onClose, service }: EditServiceModalProps) {
  const { t } = useTranslation()

  if (!service) {
    return null
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('editService.title')}
      titleId="edit-service-modal-title"
    >
      <div key={service.id} className="flex flex-col gap-4">
        <FormField
          label={t('createService.name')}
          defaultValue={service.name}
          disabled
          readOnly
        />
        <FormField
          label={t('services.durationMinutes')}
          type="number"
          defaultValue={String(service.durationMinutes)}
          disabled
          readOnly
        />
        <FormField
          label={t('createService.descriptionOptional')}
          defaultValue={service.description ?? ''}
          disabled
          readOnly
        />
        <FormField
          label={t('services.sortOrder')}
          type="number"
          defaultValue={String(service.sortOrder)}
          disabled
          readOnly
        />
        <FormField
          label={t('createService.isActive')}
          defaultValue={service.isActive ? t('common.yes') : t('common.no')}
          disabled
          readOnly
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" disabled title={t('editService.saveDisabledTitle')}>
            {t('editService.save')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
