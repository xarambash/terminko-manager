import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import sr from '../locales/sr.json'
import en from '../locales/en.json'

const STORAGE_KEY = 'terminko_lang'

const supported = ['sr', 'en'] as const
type SupportedLng = (typeof supported)[number]

function readStoredLng(): SupportedLng | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'sr' || v === 'en') return v
  } catch {
    /* ignore */
  }
  return undefined
}

function persistLng(lng: string) {
  if (typeof window === 'undefined') return
  const code = lng.startsWith('en') ? 'en' : 'sr'
  try {
    localStorage.setItem(STORAGE_KEY, code)
  } catch {
    /* ignore */
  }
}

i18n.use(initReactI18next).init({
  resources: {
    sr: { translation: sr },
    en: { translation: en },
  },
  lng: readStoredLng() ?? 'sr',
  fallbackLng: 'en',
  supportedLngs: [...supported],
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng) => {
  persistLng(lng)
})
