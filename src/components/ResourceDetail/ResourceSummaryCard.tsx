import { useEffect, useRef, useState } from 'react'
import { useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import {
  Paper,
  Avatar,
  Group,
  Stack,
  Text,
  Badge,
  Button,
  TextInput,
  Switch,
  ActionIcon,
} from '@mantine/core'
import { IconCamera } from '@tabler/icons-react'
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

export function ResourceSummaryCard({ resource, onUploadPhoto, onSave }: ResourceSummaryCardProps) {
  const { t, i18n } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fullName = `${resource.firstName} ${resource.lastName}`.trim() || t('common.dash')
  const [photoFailed, setPhotoFailed] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const displayPhoto = previewUrl ?? (photoFailed ? null : resource.profilePicture)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const form = useForm<EditForm>({
    initialValues: {
      firstName: resource.firstName,
      lastName: resource.lastName,
      email: resource.email ?? '',
      phone: resource.phone ?? '',
      isActive: resource.isActive,
    },
    validate: {
      firstName: (v) => (!v.trim() ? t('resourceDetail.summary.validationFirstName') : null),
      lastName: (v) => (!v.trim() ? t('resourceDetail.summary.validationLastName') : null),
      email: (v) =>
        !/^\S+@\S+\.\S+$/.test(v) ? t('resourceDetail.summary.validationEmail') : null,
    },
  })

  useEffect(() => {
    if (isEditMode) return
    form.setValues({
      firstName: resource.firstName,
      lastName: resource.lastName,
      email: resource.email ?? '',
      phone: resource.phone ?? '',
      isActive: resource.isActive,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, isEditMode, i18n.language])

  const handleCancel = () => {
    form.reset()
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

  const onSubmit = form.onSubmit(async (data) => {
    try {
      if (selectedFile && onUploadPhoto) {
        await onUploadPhoto(selectedFile)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setSelectedFile(null)
        setPreviewUrl(null)
        setPhotoFailed(false)
      }
      if (onSave) await onSave(data)
      setIsEditMode(false)
    } catch (err: unknown) {
      form.setErrors({ firstName: extractServerError(err) ?? t('resourceDetail.summary.errorUpdate') })
    }
  })

  if (isEditMode) {
    return (
      <Paper withBorder shadow="xs" p="md" style={{ position: 'relative' }}>
        <form onSubmit={onSubmit}>
          <div style={{ position: 'absolute', top: 'var(--mantine-spacing-md)', right: 'var(--mantine-spacing-md)' }}>
            <Group gap="xs">
              <Text size="sm" c="dimmed">{t('resourceDetail.summary.active')}</Text>
              <Switch
                checked={form.values.isActive}
                onChange={(e) => form.setFieldValue('isActive', e.currentTarget.checked)}
              />
            </Group>
          </div>
          <Group align="flex-start" gap="md">
            <div style={{ position: 'relative' }}>
              <Avatar
                src={displayPhoto}
                alt={fullName}
                size={96}
                onError={() => setPhotoFailed(true)}
              />
              {onUploadPhoto && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={onFileChange}
                  />
                  <ActionIcon
                    size="sm"
                    radius="xl"
                    variant="filled"
                    style={{ position: 'absolute', bottom: 0, right: 0 }}
                    onClick={() => fileInputRef.current?.click()}
                    title={displayPhoto ? t('resourceDetail.summary.changePhoto') : t('resourceDetail.summary.uploadPhoto')}
                  >
                    <IconCamera size={12} />
                  </ActionIcon>
                </>
              )}
            </div>
            <Stack flex={1} gap="xs">
              <Group gap="sm">
                <TextInput
                  w={210}
                  label={t('resourceDetail.summary.firstName')}
                  {...form.getInputProps('firstName')}
                />
                <TextInput
                  w={210}
                  label={t('resourceDetail.summary.lastName')}
                  {...form.getInputProps('lastName')}
                />
              </Group>
              <Group gap="sm">
                <TextInput
                  w={210}
                  label={t('resourceDetail.summary.email')}
                  type="email"
                  {...form.getInputProps('email')}
                />
                <TextInput
                  w={210}
                  label={t('resourceDetail.summary.phone')}
                  type="tel"
                  {...form.getInputProps('phone')}
                />
              </Group>
              <Group justify="flex-end" gap="sm">
                <Button variant="default" onClick={handleCancel} disabled={form.submitting}>
                  {t('resourceDetail.summary.cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={form.submitting}
                  disabled={!form.isDirty() && !selectedFile}
                >
                  {t('resourceDetail.summary.save')}
                </Button>
              </Group>
            </Stack>
          </Group>
        </form>
      </Paper>
    )
  }

  return (
    <Paper withBorder shadow="xs" p="md">
      <Group align="stretch" gap="md">
        <Avatar
          src={displayPhoto}
          alt={fullName}
          size={96}
          style={{ alignSelf: 'center' }}
          onError={() => setPhotoFailed(true)}
        />
        <Group flex={1} justify="space-between" align="stretch">
          <Stack gap={2} justify="center">
            <Text fw={600} size="lg">{fullName}</Text>
            <Text size="sm" c="dimmed">{resource.email ?? t('common.dash')}</Text>
            {resource.phone && <Text size="sm" c="dimmed">{resource.phone}</Text>}
          </Stack>
          <Stack align="flex-end" justify="space-between">
            <Badge
              color={resource.isActive ? 'green' : 'gray'}
              variant="light"
            >
              {resource.isActive
                ? t('resourceDetail.summary.statusActive')
                : t('resourceDetail.summary.statusInactive')}
            </Badge>
            <Button variant="default" size="sm" onClick={() => setIsEditMode(true)}>
              {t('resourceDetail.summary.edit')}
            </Button>
          </Stack>
        </Group>
      </Group>
    </Paper>
  )
}
