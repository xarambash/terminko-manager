/** BCP 47 locale for `toLocaleDateString` / `toLocaleTimeString` from i18next language */
export function calendarLocaleFromLng(lng: string): string {
  if (lng.startsWith('sr')) return 'sr-Latn-RS'
  return 'en-GB'
}
