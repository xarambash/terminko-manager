import { Alert, Loader, Group, Text } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { formatQueryError } from '../../lib/errors'
import type { QueryStatusBannerProps } from '../../types'

export function QueryStatusBanner({ isPending, isError, error, loadingText }: QueryStatusBannerProps) {
  if (isPending) {
    return (
      <Group gap="xs">
        <Loader size="xs" />
        <Text size="sm" c="dimmed">{loadingText}</Text>
      </Group>
    )
  }

  if (isError) {
    const message = formatQueryError(error)
    if (!message) return null
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        {message}
      </Alert>
    )
  }

  return null
}
