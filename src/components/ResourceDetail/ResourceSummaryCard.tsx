import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Camera, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FormField } from '../ui/FormField'
import { FormError } from '../ui/FormError'
import { Switch } from '../ui/Switch'
import { extractServerError } from '../../lib/errors'
import type { Resource } from '../../types/resources'

type ResourceSummaryCardProps = {
  resource: Resource
  onUploadPhoto?: (file: File) => Promise<void>
  onSave?: (fields: EditForm) => Promise<void>
}

type EditForm = {
  firstName: string
  lastName: string
  email: string
  phone: string
  isActive: boolean
}

function PhotoCircle({
  src,
  alt,
  onError,
}: {
  src: string | null
  alt: string
  onError?: () => void
}) {
  return (
    <div
      className={cn(
        'relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full',
        'border border-[var(--border)] bg-[var(--code-bg)] shadow-sm',
        'sm:size-24'
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" onError={onError} />
      ) : (
        <UserCircle className="size-[65%] text-[var(--text)] opacity-40" strokeWidth={1.25} aria-hidden />
      )}
    </div>
  )
}

export function ResourceSummaryCard({ resource, onUploadPhoto, onSave }: ResourceSummaryCardProps) {
  const { t, i18n } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fullName = `${resource.firstName} ${resource.lastName}`.trim() || t('common.dash')
  const [photoFailed, setPhotoFailed] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const hasExistingPhoto = Boolean(resource.profilePicture) && !photoFailed
  const displayPhoto = previewUrl ?? (photoFailed ? null : resource.profilePicture)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const schema = useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, t('resourceDetail.summary.validationFirstName')),
        lastName: z.string().min(1, t('resourceDetail.summary.validationLastName')),
        email: z.email(t('resourceDetail.summary.validationEmail')),
        phone: z.string(),
        isActive: z.boolean(),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language]
  )

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: resource.firstName,
      lastName: resource.lastName,
      email: resource.email ?? '',
      phone: resource.phone ?? '',
      isActive: resource.isActive,
    },
  })

  useEffect(() => {
    if (isEditMode) return
    reset({
      firstName: resource.firstName,
      lastName: resource.lastName,
      email: resource.email ?? '',
      phone: resource.phone ?? '',
      isActive: resource.isActive,
    })
  }, [resource, isEditMode, reset])

  const handleEdit = () => setIsEditMode(true)

  const handleCancel = () => {
    reset({
      firstName: resource.firstName,
      lastName: resource.lastName,
      email: resource.email ?? '',
      phone: resource.phone ?? '',
      isActive: resource.isActive,
    })
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(null)
    setPreviewUrl(null)
    setIsEditMode(false)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const onSubmit = async (data: EditForm) => {
    try {
      if (selectedFile && onUploadPhoto) {
        await onUploadPhoto(selectedFile)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setSelectedFile(null)
        setPreviewUrl(null)
        setPhotoFailed(false)
      }
      if (onSave) {
        await onSave(data)
      }
      setIsEditMode(false)
    } catch (err: unknown) {
      setError('root', {
        message: extractServerError(err) ?? t('resourceDetail.summary.errorUpdate'),
      })
    }
  }

  const activeBadge = (
    <span
      className={cn(
        'mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
        resource.isActive
          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          : 'bg-[var(--border)] text-[var(--text)]'
      )}
    >
      {resource.isActive
        ? t('resourceDetail.summary.statusActive')
        : t('resourceDetail.summary.statusInactive')}
    </span>
  )

  if (isEditMode) {
    return (
      <Card className="p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-start gap-5">
            <div className="relative shrink-0">
              <PhotoCircle
                src={displayPhoto}
                alt={t('resourceDetail.summary.profilePhotoAlt', { name: fullName })}
                onError={() => setPhotoFailed(true)}
              />
              {onUploadPhoto && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    aria-hidden
                    tabIndex={-1}
                    onChange={onFileChange}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title={
                      hasExistingPhoto || previewUrl
                        ? t('resourceDetail.summary.changePhoto')
                        : t('resourceDetail.summary.uploadPhoto')
                    }
                    className={cn(
                      'absolute bottom-0 right-0 rounded-full p-1.5',
                      'border border-[var(--border)] bg-[var(--bg)] shadow-sm',
                      'text-[var(--text-h)] transition-colors hover:bg-muted'
                    )}
                  >
                    <Camera className="size-3.5" aria-hidden />
                  </button>
                </>
              )}
            </div>
            <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
              <h2 className="truncate text-xl font-semibold text-[var(--text-h)]">{fullName}</h2>
              <label className="flex shrink-0 items-center gap-2 text-sm text-[var(--text)]">
                {t('resourceDetail.summary.active')}
                <Controller
                  control={control}
                  name="isActive"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </label>
            </div>
          </div>

          <div className="mt-5 grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label={t('resourceDetail.summary.firstName')}
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <FormField
              label={t('resourceDetail.summary.lastName')}
              {...register('lastName')}
              error={errors.lastName?.message}
            />
            <FormField
              label={t('resourceDetail.summary.email')}
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
            <FormField
              label={t('resourceDetail.summary.phone')}
              type="tel"
              {...register('phone')}
              error={errors.phone?.message}
            />
          </div>

          <FormError message={errors.root?.message} />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
              {t('resourceDetail.summary.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting || (!isDirty && !selectedFile)}>
              {isSubmitting ? t('resourceDetail.summary.saving') : t('resourceDetail.summary.save')}
            </Button>
          </div>
        </form>
      </Card>
    )
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-start gap-5">
        <PhotoCircle
          src={displayPhoto}
          alt={t('resourceDetail.summary.profilePhotoAlt', { name: fullName })}
          onError={() => setPhotoFailed(true)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-[var(--text-h)]">{fullName}</h2>
              <div className="mt-1 flex flex-col gap-y-1 text-sm text-[var(--text)]">
                <span className="truncate">{resource.email ?? t('common.dash')}</span>
                {resource.phone && <span>{resource.phone}</span>}
              </div>
            </div>
            {activeBadge}
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={handleEdit}>
              {t('resourceDetail.summary.edit')}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
