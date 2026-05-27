import { useState } from 'react'
import { Avatar, Box, Divider, Group, NavLink, Stack, Text } from '@mantine/core'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  IconCalendarEvent,
  IconLock,
  IconLogout,
  IconSparkles,
  // IconUsers, // re-enable with Guests tab
  IconUser,
} from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'
import { LanguageSwitcher } from './ui/LanguageSwitcher'
import { ThemeSwitch } from './ui/ThemeSwitch'
import { ChangePasswordModal } from './ChangePasswordModal'

type AppSidebarNavProps = {
  onNavigate?: () => void
}

export function AppSidebarNav({ onNavigate }: AppSidebarNavProps) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const owner = user?.role === 'owner'
  const location = useLocation()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  const isActive = (path: string) => location.pathname.startsWith(path)

  const fullName = user ? `${user.firstName} ${user.lastName}` : ''
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : ''

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

      <Box mt="auto" hiddenFrom="lg">
        <Divider my="sm" />
        <Group px="sm" py="xs" gap="sm" wrap="nowrap">
          <Avatar size="sm" radius="xl" color="indigo" src={user?.profilePicture ?? undefined}>
            {initials}
          </Avatar>
          <Text size="sm" fw={500} style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fullName}
          </Text>
          <ThemeSwitch />
          <LanguageSwitcher />
        </Group>
        <NavLink
          label={t('changePassword.menuItem')}
          leftSection={<IconLock size={16} />}
          onClick={() => setChangePasswordOpen(true)}
        />
        <NavLink
          label={t('common.logout')}
          leftSection={<IconLogout size={16} />}
          color="red"
          c="red"
          onClick={() => { logout(); onNavigate?.() }}
        />
      </Box>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </Stack>
  )
}
