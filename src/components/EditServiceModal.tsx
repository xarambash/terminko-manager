import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button } from './ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { FormError } from './ui/FormError'
import { FormField } from './ui/FormField'
import { useUpdateService } from '../hooks'
import { apiErrorMessageForMutation } from '../lib/errors'
import { cn } from '@/lib/utils'
import type { EditServiceModalProps } from '../types'
import type { UpdateServicePayload } from '../types/services'

type EditServiceForm = {
  name: string
  durationMinutes: string
  description: string
  sortOrder: string
  isActive: boolean
}

function EditServiceFormContent({
  service,
  onClose,
}: {
  service: NonNullable<EditServiceModalProps['service']>
  onClose: () => void
}) {
  const { t } = useTranslation()
  const updateMutation = useUpdateService()

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t('createService.validation.name')),
        durationMinutes: z
          .string()
          .min(1, t('createService.validation.duration'))
          .refine(
            (s) => /^\d+$/.test(s) && Number.parseInt(s, 10) > 0,
            t('createService.validation.duration')
          ),
        description: z.string(),
        sortOrder: z.string(),
        isActive: z.boolean(),
      }),
    [t]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<EditServiceForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: service.name,
      durationMinutes: String(service.durationMinutes),
      description: service.description ?? '',
      sortOrder: String(service.sortOrder),
      isActive: service.isActive,
    },
  })

  const closeModal = () => {
    reset()
    updateMutation.reset()
    onClose()
  }

  const onSubmit = async (data: EditServiceForm) => {
    const payload: UpdateServicePayload = {
      name: data.name.trim(),
      durationMinutes: Number.parseInt(data.durationMinutes, 10),
      isActive: data.isActive,
    }
    payload.description = data.description?.trim() || null
    const so = data.sortOrder?.trim()
    if (so !== undefined && so !== '') {
      const n = Number.parseInt(so, 10)
      if (!Number.isNaN(n)) {
        payload.sortOrder = n
      }
    }
    try {
      await updateMutation.mutateAsync({ serviceId: service.id, body: payload })
      closeModal()
    } catch (err: unknown) {
      setError('root', {
        message: apiErrorMessageForMutation(err, t, 'editService.errorSave'),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormField
        label={t('createService.name')}
        {...register('name')}
        error={errors.name?.message}
      />
      <FormField
        label={t('services.durationMinutes')}
        type="number"
        min={1}
        step={1}
        {...register('durationMinutes')}
        error={errors.durationMinutes?.message}
      />
      <FormField
        label={t('createService.descriptionOptional')}
        {...register('description')}
        error={errors.description?.message}
      />
      <FormField
        label={t('createService.sortOrderOptional')}
        type="number"
        min={0}
        step={1}
        {...register('sortOrder')}
        error={errors.sortOrder?.message}
      />
      <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          className={cn(
            'size-4 shrink-0 rounded border border-input accent-primary',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
          )}
          {...register('isActive')}
        />
        {t('createService.isActive')}
      </label>
      <FormError
        message={
          errors.root?.message ??
          (updateMutation.isError
            ? apiErrorMessageForMutation(updateMutation.error, t, 'editService.errorSave')
            : undefined)
        }
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('common.saving') : t('editService.save')}
        </Button>
      </div>
    </form>
  )
}

export function EditServiceModal({ open, onClose, service }: EditServiceModalProps) {
  const { t, i18n } = useTranslation()

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
          <DialogTitle>{t('editService.title')}</DialogTitle>
        </DialogHeader>
        <EditServiceFormContent key={`${service.id}-${i18n.language}`} service={service} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
