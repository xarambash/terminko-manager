import { useTranslation } from 'react-i18next'
import { ChevronDownIcon } from 'lucide-react'

import { Button } from './Button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from './dropdown-menu'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const value = i18n.language.startsWith('en') ? 'en' : 'sr'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          aria-label={t('languages.switcherLabel')}
          className="gap-1"
        >
          {value === 'en' ? t('languages.en') : t('languages.sr')}
          <ChevronDownIcon className="size-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(lang) => void i18n.changeLanguage(lang)}
        >
          <DropdownMenuRadioItem value="sr">{t('languages.sr')}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="en">{t('languages.en')}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
