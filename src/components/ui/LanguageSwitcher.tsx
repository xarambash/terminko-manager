import { useTranslation } from 'react-i18next'

const selectClass =
  'rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-h)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]'

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation()

  const value = i18n.language.startsWith('en') ? 'en' : 'sr'

  return (
    <select
      className={selectClass}
      aria-label={t('languages.switcherLabel')}
      value={value}
      onChange={(e) => void i18n.changeLanguage(e.target.value)}
    >
      <option value="sr">{t('languages.sr')}</option>
      <option value="en">{t('languages.en')}</option>
    </select>
  )
}
