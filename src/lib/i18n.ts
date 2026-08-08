export const LOCALES = ['en', 'fr', 'he'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'
export const RTL_LOCALES: Locale[] = ['he']

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  he: 'עברית',
}

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value)

export const dirFor = (locale: Locale): 'ltr' | 'rtl' =>
  RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr'

/**
 * English lives at the root (/tours) while other locales are prefixed
 * (/fr/tours). This keeps the primary market's URLs clean and matches the
 * canonical structure the site is marketed on.
 */
export const localePath = (locale: Locale, path: string): string => {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (locale === DEFAULT_LOCALE) return clean
  return clean === '/' ? `/${locale}` : `/${locale}${clean}`
}

/** Strips a locale prefix back to the canonical path. */
export const stripLocale = (pathname: string): string => {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue
    if (pathname === `/${locale}`) return '/'
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1)
  }
  return pathname
}
