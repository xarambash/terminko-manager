import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import {
  getResolvedDark,
  setUserColorScheme,
  subscribeTheme,
} from '@/lib/theme'

export function ThemeSwitch() {
  const { t } = useTranslation()
  const isDark = useSyncExternalStore(
    subscribeTheme,
    getResolvedDark,
    () => false,
  )

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={t('theme.toggleAria')}
      title={t('theme.toggleAria')}
      onClick={() => setUserColorScheme(isDark ? 'light' : 'dark')}
      className="text-[var(--text)] hover:text-[var(--text-h)]"
    >
      {isDark ? (
        <Moon className="size-4 text-[rgb(var(--docs-primary-light))]" aria-hidden />
      ) : (
        <Sun className="size-4" aria-hidden />
      )}
    </Button>
  )
}
