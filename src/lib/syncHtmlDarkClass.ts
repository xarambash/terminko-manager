/**
 * Tailwind `dark:` variants use `@custom-variant dark (&:is(.dark *))` — they only
 * apply under an ancestor with class `dark`. System colors in index.css use
 * `@media (prefers-color-scheme: dark)` on `:root`, which does not set that class.
 * Keep `<html class="dark">` in sync with the user’s OS theme so both match.
 */
export function syncHtmlDarkClassFromSystem(): void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const apply = () => {
    document.documentElement.classList.toggle('dark', mq.matches)
  }
  apply()
  mq.addEventListener('change', apply)
}
