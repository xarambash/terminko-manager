import { useTranslation } from 'react-i18next'
import { DropdownPicker } from './DropdownPicker'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const value = i18n.language.startsWith('en') ? 'en' : 'sr'
  const options = [
    { value: 'sr', label: t('languages.sr') },
    { value: 'en', label: t('languages.en') },
  ]

  return (
    <DropdownPicker
      value={value}
      options={options}
      onValueChange={(lang) => void i18n.changeLanguage(lang)}
      ariaLabel={t('languages.switcherLabel')}
      className="gap-1"
      size="sm"
    />
  )
}
