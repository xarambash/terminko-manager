import { useEffect, useRef, useState } from 'react'
import { useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from '@mantine/hooks'
import {
  Paper,
  Avatar,
  Group,
  Stack,
  Text,
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
  const isMobile = useMediaQuery('(max-width: 768px)')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoFailed, setPhotoFailed] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | undefined>()
  const [formError, setFormError] = useState<string | undefined>()

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
    if (form.isDirty() || selectedFile) return
    form.setValues({
      firstName: resource.firstName,
      lastName: resource.lastName,
      email: resource.email ?? '',
      phone: resource.phone ?? '',
      isActive: resource.isActive,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, i18n.language])

  const handleDiscard = () => {
    form.reset()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(null)
    setPreviewUrl(null)
    setPhotoError(undefined)
    setFormError(undefined)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setPhotoError(undefined)
  }

  const onSubmit = form.onSubmit(async (data) => {
    setPhotoError(undefined)
    setFormError(undefined)

    if (selectedFile && onUploadPhoto) {
      try {
        await onUploadPhoto(selectedFile)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setSelectedFile(null)
        setPreviewUrl(null)
        setPhotoFailed(false)
      } catch (err: unknown) {
        setPhotoError(extractServerError(err) ?? t('resourceDetail.summary.errorUploadPhoto'))
        return
      }
    }

    try {
      if (onSave) await onSave(data)
    } catch (err: unknown) {
      setFormError(extractServerError(err) ?? t('resourceDetail.summary.errorUpdate'))
    }
  })

  const avatarSection = (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <Avatar
        src={displayPhoto}
        alt={resource.firstName}
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
  )

  const isDirty = form.isDirty() || !!selectedFile

  const bottomRow = (
    <Group justify="space-between" mt="md" align="center">
      <Group gap="xs">
        <Text size="sm" c="dimmed">{t('resourceDetail.summary.active')}</Text>
        <Switch
          checked={form.values.isActive}
          onChange={(e) => form.setFieldValue('isActive', e.currentTarget.checked)}
        />
      </Group>
      <Text size="sm" c="red" role="alert" style={{ flex: 1, textAlign: 'center' }}>
        {photoError ?? formError ?? ''}
      </Text>
      <Group gap="sm">
        <Button variant="default" onClick={handleDiscard} disabled={!isDirty || form.submitting}>
          {t('resourceDetail.summary.discard')}
        </Button>
        <Button type="submit" loading={form.submitting} disabled={!isDirty}>
          {t('resourceDetail.summary.save')}
        </Button>
      </Group>
    </Group>
  )

  if (isMobile) {
    return (
      <Paper withBorder shadow="xs" p="md">
        <form onSubmit={onSubmit}>
          <Stack gap="xs" align="center" mb="md">
            {avatarSection}
          </Stack>
          <Stack gap="xs">
            <TextInput
              label={t('resourceDetail.summary.firstName')}
              {...form.getInputProps('firstName')}
            />
            <TextInput
              label={t('resourceDetail.summary.lastName')}
              {...form.getInputProps('lastName')}
            />
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
          </Stack>
          {bottomRow}
        </form>
      </Paper>
    )
  }

  return (
    <Paper withBorder shadow="xs" p="md">
      <form onSubmit={onSubmit}>
        <Group align="center" gap="md">
          {avatarSection}
          <Stack flex={1} gap="xs">
            <Group gap="sm">
              <TextInput
                flex={1}
                label={t('resourceDetail.summary.firstName')}
                {...form.getInputProps('firstName')}
              />
              <TextInput
                flex={1}
                label={t('resourceDetail.summary.lastName')}
                {...form.getInputProps('lastName')}
              />
            </Group>
            <Group gap="sm">
              <TextInput
                flex={1}
                label={t('resourceDetail.summary.email')}
                type="email"
                {...form.getInputProps('email')}
              />
              <TextInput
                flex={1}
                label={t('resourceDetail.summary.phone')}
                type="tel"
                {...form.getInputProps('phone')}
              />
            </Group>
          </Stack>
        </Group>
        {bottomRow}
      </form>
    </Paper>
  )
}
