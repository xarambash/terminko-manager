import { Group, ActionIcon, Title } from '@mantine/core'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IconArrowLeft } from '@tabler/icons-react'
import type { PageSectionHeaderProps } from '../../types'

export function PageSectionHeader({
  title,
  showBackLink = false,
  backTo = '/appointments',
  backLabel,
  actions,
}: PageSectionHeaderProps) {
  const { t } = useTranslation()
  const backAriaLabel = backLabel ?? t('nav.backAppointments')

  return (
    <Group justify="space-between" wrap="wrap">
      <Group gap="xs">
        {showBackLink && (
          <ActionIcon
            component={Link}
            to={backTo}
            variant="subtle"
            color="gray"
            aria-label={backAriaLabel}
            title={backAriaLabel}
            visibleFrom="sm"
          >
            <IconArrowLeft size={16} />
          </ActionIcon>
        )}
        {title && <Title order={3}>{title}</Title>}
      </Group>
      {actions && <Group gap="xs">{actions}</Group>}
    </Group>
  )
}
