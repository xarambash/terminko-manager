import { NavLink, Stack, Text } from '@mantine/core'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  IconCalendarEvent,
  IconSparkles,
  // IconUsers, // re-enable with Guests tab
  IconUser,
} from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'

type AppSidebarNavProps = {
  onNavigate?: () => void
}

export function AppSidebarNav({ onNavigate }: AppSidebarNavProps) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const owner = user?.role === 'owner'
  const location = useLocation()

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <Stack gap={4} h="100%">
      <Text size="xs" fw={600} tt="uppercase" c="dimmed" px="sm" mb={4} style={{ letterSpacing: '0.08em' }}>
        {t('nav.workspace')}
      </Text>

      <NavLink
        component={Link}
        to="/appointments"
        label={t('nav.appointments')}
        leftSection={<IconCalendarEvent size={16} />}
        active={isActive('/appointments')}
        onClick={onNavigate}
      />

      {owner && (
        <>
          <NavLink
            component={Link}
            to="/services"
            label={t('nav.services')}
            leftSection={<IconSparkles size={16} />}
            active={isActive('/services')}
            onClick={onNavigate}
          />
          {/* Guests tab — temporarily disabled; uncomment to re-enable
          <NavLink
            component={Link}
            to="/guests"
            label={t('nav.guests')}
            leftSection={<IconUsers size={16} />}
            active={isActive('/guests')}
            onClick={onNavigate}
          />
          */}
          <NavLink
            component={Link}
            to="/resources"
            label={t('nav.resources')}
            leftSection={<IconUser size={16} />}
            active={isActive('/resources')}
            onClick={onNavigate}
          />
        </>
      )}
    </Stack>
  )
}
