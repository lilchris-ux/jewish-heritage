import Link from 'next/link'
import { LanguageSwitcher } from './LanguageSwitcher'
import { WhatsAppLink } from './WhatsAppLink'
import { localePath, type Locale } from '../lib/i18n'

type NavLink = { label?: string | null; href?: string | null; id?: string | null }

export function Header({
  locale,
  companyName,
  links,
  whatsapp,
}: {
  locale: Locale
  companyName: string
  links: NavLink[]
  whatsapp: string | null
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href={localePath(locale, '/')}
          className="font-[family-name:var(--font-display)] text-lg font-semibold text-indigo-900"
        >
          {companyName}
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.id ?? `${link.href}`}
              href={localePath(locale, link.href ?? '/')}
              className="text-ink-muted transition-colors hover:text-indigo-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher current={locale} />
          {whatsapp ? (
            <WhatsAppLink
              href={whatsapp}
              placement="header"
              className="hidden rounded-md bg-indigo-700 px-4 py-2 text-sm font-semibold text-sand-50 transition-colors hover:bg-indigo-900 sm:block"
            >
              WhatsApp
            </WhatsAppLink>
          ) : null}
        </div>
      </div>
    </header>
  )
}
