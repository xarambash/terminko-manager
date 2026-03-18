import type { FormErrorProps } from '../../types'

export function FormError({ message }: FormErrorProps) {
  if (!message) return null
  return <p className="text-sm text-red-500">{message}</p>
}
