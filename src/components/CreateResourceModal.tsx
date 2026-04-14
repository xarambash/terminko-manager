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
import { useCreateResource } from '../hooks'
import { extractServerError } from '../lib/errors'
import type { CreateResourceModalProps } from '../types'

type CreateResourceForm = {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  profilePicture?: string
}

function CreateResourceFormContent({
  onClose,
}: {
  onClose: () => void
}) {
  const { t } = useTranslation()
  const createMutation = useCreateResource()

  const createResourceSchema = useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, t('createResource.validation.firstName')),
        lastName: z.string().min(1, t('createResource.validation.lastName')),
        email: z.string().min(1, t('createResource.validation.emailRequired')).email(t('createResource.validation.invalidEmail')),
        password: z.string().min(8, t('createResource.validation.password')),
        phone: z.string().optional(),
        profilePicture: z.string().optional(),
      }),
    [t]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateResourceForm>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      profilePicture: '',
    },
  })

  const closeModal = () => {
    reset()
    createMutation.reset()
    onClose()
  }

  const onSubmit = async (data: CreateResourceForm) => {
    try {
      await createMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        ...(data.phone?.trim() && { phone: data.phone.trim() }),
        ...(data.profilePicture?.trim() && {
          profilePicture: data.profilePicture.trim(),
        }),
      })
      closeModal()
    } catch (err: unknown) {
      setError('root', {
        message: extractServerError(err) ?? t('createResource.errorCreate'),
      })
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">{t('createResource.intro')}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          label={t('common.firstName')}
          {...register('firstName')}
          error={errors.firstName?.message}
        />
        <FormField
          label={t('common.lastName')}
          {...register('lastName')}
          error={errors.lastName?.message}
        />
        <FormField
          label={t('common.email')}
          type="email"
          autoComplete="off"
          {...register('email')}
          error={errors.email?.message}
        />
        <FormField
          label={t('common.password')}
          type="password"
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
        />
        <FormField
          label={t('createResource.phoneOptional')}
          {...register('phone')}
          error={errors.phone?.message}
        />
        <FormField
          label={t('createResource.profileUrlOptional')}
          {...register('profilePicture')}
          error={errors.profilePicture?.message}
        />
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

export function CreateResourceModal({ open, onClose }: CreateResourceModalProps) {
  const { t, i18n } = useTranslation()

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle id="resource-modal-title">{t('createResource.title')}</DialogTitle>
        </DialogHeader>
        <CreateResourceFormContent key={i18n.language} onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}
