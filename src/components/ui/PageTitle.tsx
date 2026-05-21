import { Title } from '@mantine/core'
import type { PageTitleProps } from '../../types'

export function PageTitle({ children, className }: PageTitleProps) {
  return (
    <Title order={2} className={className}>
      {children}
    </Title>
  )
}
