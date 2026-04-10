import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Upload, UserCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import type { Resource } from '../../types/resources'

type ResourceSummaryCardProps = {
  resource: Resource
  /** Called after user picks a file (e.g. upload to API). */
  onUploadPhoto?: (file: File) => void
}

export function ResourceSummaryCard({ resource, onUploadPhoto }: ResourceSummaryCardProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fullName = `${resource.firstName} ${resource.lastName}`.trim() || t('common.dash')
  const hasPhoto = Boolean(resource.profilePicture?.trim())
  const [photoFailed, setPhotoFailed] = useState(false)
  const showImage = hasPhoto && !photoFailed

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file && onUploadPhoto) onUploadPhoto(file)
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col items-stretch">
        <div className="flex flex-col items-center gap-3 self-start">
          <div
            className={cn(
              'relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full',
              'border-2 border-[var(--border)] bg-[var(--code-bg)] shadow-sm ring-1 ring-[var(--border)]/60',
              'sm:size-32'
            )}
          >
            {showImage ? (
              <img
                src={resource.profilePicture!}
                alt={t('resourceDetail.summary.profilePhotoAlt', { name: fullName })}
                className="size-full object-cover"
                onError={() => setPhotoFailed(true)}
              />
            ) : (
              <UserCircle
                className="size-[70%] text-[var(--text)] opacity-50"
                strokeWidth={1.25}
                aria-hidden
              />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-hidden
            tabIndex={-1}
            onChange={onFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full min-w-[7.5rem] gap-1.5"
            disabled={!onUploadPhoto}
            title={onUploadPhoto ? undefined : t('resourceDetail.summary.uploadDisabledTitle')}
            aria-label={t('resourceDetail.summary.uploadPhoto')}
            onClick={() => onUploadPhoto && fileInputRef.current?.click()}
          >
            <Upload aria-hidden className="size-3.5" />
            {t('resourceDetail.summary.uploadPhoto')}
          </Button>
        </div>

        <dl className="grid w-full min-w-0 grid-cols-1 gap-x-6 gap-y-4 pt-6 text-sm sm:grid-cols-2 mt-4">
          <div>
            <dt className="text-[var(--text)]">{t('resourceDetail.summary.name')}</dt>
            <dd className="mt-0.5 font-medium text-[var(--text-h)]">{fullName}</dd>
          </div>
          <div>
            <dt className="text-[var(--text)]">{t('resourceDetail.summary.email')}</dt>
            <dd className="mt-0.5 font-medium text-[var(--text-h)]">
              {resource.email ?? t('common.dash')}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text)]">{t('resourceDetail.summary.phone')}</dt>
            <dd className="mt-0.5 font-medium text-[var(--text-h)]">
              {resource.phone ?? t('common.dash')}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text)]">{t('resourceDetail.summary.active')}</dt>
            <dd className="mt-0.5 font-medium text-[var(--text-h)]">
              {resource.isActive ? t('common.yes') : t('common.no')}
            </dd>
          </div>
        </dl>
      </div>
    </Card>
  )
}
