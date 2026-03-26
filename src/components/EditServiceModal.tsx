import { useTranslation } from 'react-i18next'
import { Button } from './ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { FormField } from './ui/FormField'
import type { EditServiceModalProps } from '../types'

export function EditServiceModal({ open, onClose, service }: EditServiceModalProps) {
  const { t } = useTranslation()

  if (!service) {
    return null
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle id="edit-service-modal-title">{t('editService.title')}</DialogTitle>
        </DialogHeader>
        <div key={service.id} className="flex flex-col gap-4">
          <FormField
            id="edit-service-name"
            label={t('createService.name')}
            defaultValue={service.name}
            disabled
            readOnly
          />
          <FormField
            id="edit-service-duration"
            label={t('services.durationMinutes')}
            type="number"
            defaultValue={String(service.durationMinutes)}
            disabled
            readOnly
          />
          <FormField
            id="edit-service-description"
            label={t('createService.descriptionOptional')}
            defaultValue={service.description ?? ''}
            disabled
            readOnly
          />
          <FormField
            id="edit-service-sort"
            label={t('services.sortOrder')}
            type="number"
            defaultValue={String(service.sortOrder)}
            disabled
            readOnly
          />
          <FormField
            id="edit-service-active"
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
      </DialogContent>
    </Dialog>
  )
}
