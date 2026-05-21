import { TextInput } from '@mantine/core'
import type { ComponentProps } from 'react'

type FormFieldProps = ComponentProps<typeof TextInput> & {
  label: string
  error?: string
}

export function FormField({ label, error, ...props }: FormFieldProps) {
  return <TextInput label={label} error={error} {...props} />
}
