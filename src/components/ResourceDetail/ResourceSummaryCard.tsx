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
      <Paper withBorder shadow="xs" p="md">
        <form onSubmit={onSubmit}>
          <Group align="flex-start" gap="md" mb="md">
            <div style={{ position: 'relative' }}>
              <Avatar
                src={displayPhoto}
                alt={fullName}
                size={80}
                radius="xl"
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
            <Group flex={1} justify="space-between" align="flex-start">
              <Text fw={600} size="lg">{fullName}</Text>
              <Group gap="xs">
                <Text size="sm" c="dimmed">{t('resourceDetail.summary.active')}</Text>
                <Switch
                  checked={form.values.isActive}
                  onChange={(e) => form.setFieldValue('isActive', e.currentTarget.checked)}
                />
              </Group>
            </Group>
          </Group>
          <Stack gap="sm" maw={480}>
            <Group grow>
              <TextInput
                label={t('resourceDetail.summary.firstName')}
                {...form.getInputProps('firstName')}
              />
              <TextInput
                label={t('resourceDetail.summary.lastName')}
                {...form.getInputProps('lastName')}
              />
            </Group>
            <Group grow>
              <TextInput
                label={t('resourceDetail.summary.email')}
                type="email"
                {...form.getInputProps('email')}
              />
              <TextInput
                label={t('resourceDetail.summary.phone')}
                type="tel"
                {...form.getInputProps('phone')}
              />
            </Group>
          </Stack>
          <Group justify="flex-end" gap="sm" mt="md">
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
        </form>
      </Paper>
    )
  }

  return (
    <Paper withBorder shadow="xs" p="md">
      <Group align="flex-start" gap="md">
        <Avatar
          src={displayPhoto}
          alt={fullName}
          size={80}
          radius="xl"
          onError={() => setPhotoFailed(true)}
        />
        <Stack flex={1} gap="xs">
          <Group justify="space-between" align="flex-start">
            <Stack gap={2}>
              <Text fw={600} size="lg">{fullName}</Text>
              <Text size="sm" c="dimmed">{resource.email ?? t('common.dash')}</Text>
              {resource.phone && <Text size="sm" c="dimmed">{resource.phone}</Text>}
            </Stack>
            <Badge
              color={resource.isActive ? 'green' : 'gray'}
              variant="light"
            >
              {resource.isActive
                ? t('resourceDetail.summary.statusActive')
                : t('resourceDetail.summary.statusInactive')}
            </Badge>
          </Group>
          <Group justify="flex-end" mt="xs">
            <Button variant="default" size="sm" onClick={() => setIsEditMode(true)}>
              {t('resourceDetail.summary.edit')}
            </Button>
          </Group>
        </Stack>
      </Group>
    </Paper>
  )
}
