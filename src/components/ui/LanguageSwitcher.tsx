import { Menu, Button } from '@mantine/core'
import { IconChevronDown } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const value = i18n.language.startsWith('en') ? 'en' : 'sr'
  const options = [
    { value: 'sr', label: t('languages.sr') },
    { value: 'en', label: t('languages.en') },
  ]
  const current = options.find((o) => o.value === value)

  return (
    <Menu shadow="md" width={120} position="bottom-end">
      <Menu.Target>
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          rightSection={<IconChevronDown size={12} />}
          aria-label={t('languages.switcherLabel')}
        >
          {current?.label}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {options.map((opt) => (
          <Menu.Item
            key={opt.value}
            onClick={() => void i18n.changeLanguage(opt.value)}
            fw={opt.value === value ? 600 : undefined}
          >
            {opt.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  )
}
