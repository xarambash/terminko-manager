import { ActionIcon, useMantineColorScheme } from '@mantine/core'
import { IconSun, IconMoon } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

export function ThemeSwitch() {
  const { t } = useTranslation()
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      size="sm"
      aria-label={t('theme.toggleAria')}
      title={t('theme.toggleAria')}
      onClick={toggleColorScheme}
    >
      {isDark ? <IconMoon size={16} /> : <IconSun size={16} />}
    </ActionIcon>
  )
}
