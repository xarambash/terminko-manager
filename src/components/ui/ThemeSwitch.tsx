import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { Moon, Sun } from 'lucide-react'
import { Switch as SwitchPrimitives } from 'radix-ui'

import { cn } from '@/lib/utils'
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
    <div className="flex items-center gap-1.5">
      <Sun
        className={cn(
          'size-4 shrink-0 transition-opacity',
          isDark ? 'text-[var(--text)] opacity-40' : 'text-[var(--text-h)] opacity-90',
        )}
        aria-hidden
      />
      <SwitchPrimitives.Root
        checked={isDark}
        onCheckedChange={(checked) =>
          setUserColorScheme(checked ? 'dark' : 'light')
        }
        aria-label={t('theme.toggleAria')}
        className={cn(
          'inline-flex h-7 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border bg-muted px-0.5 shadow-none transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'data-[state=checked]:border-primary/40 data-[state=checked]:bg-primary/25',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            'pointer-events-none block size-5 rounded-full bg-background shadow-sm ring-0 transition-transform duration-200',
            'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
          )}
        />
      </SwitchPrimitives.Root>
      <Moon
        className={cn(
          'size-4 shrink-0 transition-opacity',
          isDark
          ? 'text-[rgb(var(--docs-primary-light))] opacity-95'
          : 'text-[var(--text)] opacity-40',
        )}
        aria-hidden
      />
    </div>
  )
}
