import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { Button } from './ui/Button'
import { FormError } from './ui/FormError'
import { FormField } from './ui/FormField'
import { Modal } from './ui/Modal'
import { useCreateService } from '../hooks'
import { extractServerError } from '../lib/errors'
import type { CreateServiceModalProps } from '../types'
import type { CreateServicePayload } from '../types/services'

type CreateServiceForm = {
  name: string
  durationMinutes: string
  description: string
  sortOrder: string
  isActive: boolean
}

function CreateServiceFormContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const createMutation = useCreateService()

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
  } = useForm<CreateServiceForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      durationMinutes: '30',
      description: '',
      sortOrder: '',
      isActive: true,
    },
  })

  const closeModal = () => {
    reset()
    createMutation.reset()
    onClose()
  }

  const onSubmit = async (data: CreateServiceForm) => {
    const payload: CreateServicePayload = {
      name: data.name.trim(),
      durationMinutes: Number.parseInt(data.durationMinutes, 10),
      isActive: data.isActive,
    }
    if (data.description?.trim()) {
      payload.description = data.description.trim()
    }
    const so = data.sortOrder?.trim()
    if (so !== undefined && so !== '') {
      const n = Number.parseInt(so, 10)
      if (!Number.isNaN(n)) {
        payload.sortOrder = n
      }
    }
    try {
      await createMutation.mutateAsync(payload)
      closeModal()
    } catch (err: unknown) {
      setError('root', {
        message: extractServerError(err) ?? t('createService.errorCreate'),
      })
    }
  }

  const inputClass =
    'rounded border border-[var(--border)] bg-[var(--bg)] text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]'

  return (
    <>
      <p className="mb-4 text-sm text-[var(--text)]">{t('createService.intro')}</p>
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
        <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-h)]">
          <input
            type="checkbox"
            className={`size-4 ${inputClass}`}
            {...register('isActive')}
          />
          {t('createService.isActive')}
        </label>
        <FormError
          message={
            errors.root?.message ??
            (createMutation.isError
              ? extractServerError(createMutation.error)
              : undefined)
          }
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={closeModal}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('common.creating') : t('common.create')}
          </Button>
        </div>
      </form>
    </>
  )
}

export function CreateServiceModal({ open, onClose }: CreateServiceModalProps) {
  const { t, i18n } = useTranslation()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('createService.title')}
      titleId="create-service-modal-title"
    >
      <CreateServiceFormContent key={i18n.language} onClose={onClose} />
    </Modal>
  )
}
