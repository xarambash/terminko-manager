import { Text } from '@mantine/core'
import type { FormErrorProps } from '../../types'

export function FormError({ message }: FormErrorProps) {
  if (!message) return null
  return (
    <Text size="sm" c="red" role="alert">
      {message}
    </Text>
  )
}
