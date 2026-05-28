import { useState } from 'react'
import { Group, Burger, Menu, UnstyledButton, Text, Avatar, Drawer, Stack, Divider, NavLink, Box } from '@mantine/core'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IconChevronDown, IconLock, IconLogout } from '@tabler/icons-react'
import { LanguageSwitcher } from './ui/LanguageSwitcher'
import { ThemeSwitch } from './ui/ThemeSwitch'
import { TenantBrandName } from './TenantBrandName'
import { ChangePasswordModal } from './ChangePasswordModal'
import { useAuth } from '../hooks'

type AppHeaderProps = {
  mobileOpen: boolean
  onMobileToggle: () => void
}

export function AppHeader({ mobileOpen, onMobileToggle }: AppHeaderProps) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const fullName = user ? `${user.firstName} ${user.lastName}` : ''
  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : ''

  return (
    <>
      <Group h="100%" px="md" justify="space-between" wrap="nowrap">
        <Group gap="sm">
          <Burger
            opened={mobileOpen}
            onClick={onMobileToggle}
            hiddenFrom="lg"
            size="sm"
            aria-label={t('nav.openMenu')}
          />
          <Box visibleFrom="lg">
            <Link
              to="/appointments"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <TenantBrandName />
            </Link>
          </Box>
        </Group>

        {/* Desktop: ThemeSwitch + LanguageSwitcher + dropdown menu */}
        <Group gap="xs" visibleFrom="lg">
          <ThemeSwitch />
          <LanguageSwitcher />
          <Menu shadow="md" width={220} position="bottom-end">
            <Menu.Target>
              <UnstyledButton>
                <Group gap={6}>
                  <Avatar size="sm" radius="xl" color="indigo" src={user?.profilePicture ?? undefined}>
                    {initials}
                  </Avatar>
                  <IconChevronDown size={14} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Group px="sm" py="xs" gap="sm" wrap="nowrap">
                <Avatar size="md" radius="xl" color="indigo" src={user?.profilePicture ?? undefined}>
                  {initials}
                </Avatar>
                <Text size="sm" fw={500} style={{ lineHeight: 1.3 }}>
                  {fullName}
                </Text>
              </Group>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLock size={14} />}
                onClick={() => setChangePasswordOpen(true)}
              >
                {t('changePassword.menuItem')}
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconLogout size={14} />}
                color="red"
                onClick={logout}
              >
                {t('common.logout')}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {/* Mobile: theme + language + avatar (avatar opens bottom drawer) */}
        <Group hiddenFrom="lg" gap="xs" wrap="nowrap">
          <ThemeSwitch />
          <LanguageSwitcher />
          <UnstyledButton onClick={() => setDrawerOpen(true)}>
            <Avatar size="sm" radius="xl" color="indigo" src={user?.profilePicture ?? undefined}>
              {initials}
            </Avatar>
          </UnstyledButton>
        </Group>
      </Group>

      {/* Mobile account drawer */}
      <Drawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        position="bottom"
        size="auto"
        withCloseButton={false}
        radius="md"
        padding={0}
        styles={{ content: { height: 'fit-content' } }}
      >
        <Box py="xs" style={{ display: 'flex', justifyContent: 'center' }}>
          <Box w={32} h={4} bg="gray.5" style={{ borderRadius: 2 }} />
        </Box>
        <Stack gap={0} pb="md">
          <Group gap="sm" px="md" pb="sm">
            <Avatar size="md" radius="xl" color="indigo" src={user?.profilePicture ?? undefined}>
              {initials}
            </Avatar>
            <Text size="sm" fw={500}>{fullName}</Text>
          </Group>
          <Divider />
          <NavLink
            label={t('changePassword.menuItem')}
            leftSection={<IconLock size={16} />}
            onClick={() => {
              setDrawerOpen(false)
              setChangePasswordOpen(true)
            }}
          />
          <Divider />
          <NavLink
            label={t('common.logout')}
            leftSection={<IconLogout size={16} />}
            c="red"
            onClick={() => {
              setDrawerOpen(false)
              logout()
            }}
          />
        </Stack>
      </Drawer>

      <ChangePasswordModal
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />
    </>
  )
}
