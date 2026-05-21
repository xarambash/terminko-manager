import { Group, Burger } from '@mantine/core'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './ui/LanguageSwitcher'
import { ThemeSwitch } from './ui/ThemeSwitch'
import { TenantBrandName } from './TenantBrandName'

type AppHeaderProps = {
  mobileOpen: boolean
  onMobileToggle: () => void
}

export function AppHeader({ mobileOpen, onMobileToggle }: AppHeaderProps) {
  const { t } = useTranslation()

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="sm">
        <Burger
          opened={mobileOpen}
          onClick={onMobileToggle}
          hiddenFrom="lg"
          size="sm"
          aria-label={t('nav.openMenu')}
        />
        <Link
          to="/appointments"
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <TenantBrandName />
        </Link>
      </Group>

      <Group gap="xs">
        <ThemeSwitch />
        <LanguageSwitcher />
      </Group>
    </Group>
  )
}
