const STORAGE_KEY = 'terminko-manager-theme'

export type UserColorScheme = 'light' | 'dark'

function getStored(): UserColorScheme | null {
  if (typeof window === 'undefined') return null
  const theme = localStorage.getItem(STORAGE_KEY)
  if (theme === 'light' || theme === 'dark') return theme
  return null
}

function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Effective dark mode: explicit user choice or OS preference. */
export function getResolvedDark(): boolean {
  const stored = getStored()
  if (stored === 'light') return false
  if (stored === 'dark') return true
  return systemPrefersDark()
}

function applyDom(): void {
  document.documentElement.classList.toggle('dark', getResolvedDark())
}

const listeners = new Set<() => void>()

function emit(): void {
  for (const fn of listeners) fn()
}

export function subscribeTheme(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

/** Persist light/dark (overrides system until changed again). */
export function setUserColorScheme(mode: UserColorScheme): void {
  localStorage.setItem(STORAGE_KEY, mode)
  applyDom()
  emit()
}

/**
 * Apply theme and follow OS changes only while the user has no stored preference.
 */
export function initTheme(): void {
  applyDom()
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onSystemChange = () => {
    if (getStored() !== null) return
    applyDom()
    emit()
  }
  mq.addEventListener('change', onSystemChange)
}
