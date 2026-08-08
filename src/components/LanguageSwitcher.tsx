'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LOCALES, LOCALE_LABELS, localePath, stripLocale, type Locale } from '../lib/i18n'

export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() ?? '/'
  const canonical = stripLocale(pathname)

  return (
    <nav aria-label="Language" className="flex items-center gap-2 text-xs">
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          href={localePath(locale, canonical)}
          hrefLang={locale}
          aria-current={locale === current ? 'true' : undefined}
          className={
            locale === current
              ? 'font-semibold text-indigo-900'
              : 'text-ink-muted hover:text-indigo-700'
          }
        >
          {LOCALE_LABELS[locale]}
        </Link>
      ))}
    </nav>
  )
}
