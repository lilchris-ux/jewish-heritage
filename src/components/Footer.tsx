import Link from 'next/link'
import { localePath, type Locale } from '../lib/i18n'
import { PLACEHOLDER } from '../lib/site'

type NavLink = { label?: string | null; href?: string | null; id?: string | null }
type Group = { title?: string | null; links?: NavLink[] | null; id?: string | null }

export function Footer({
  locale,
  companyName,
  groups,
  email,
  phone,
  address,
}: {
  locale: Locale
  companyName: string
  groups: Group[]
  email?: string | null
  phone?: string | null
  address?: string | null
}) {
  return (
    <footer className="mt-20 border-t border-sand-200 bg-sand-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-indigo-900">
            {companyName}
          </p>
          <p className="text-sm whitespace-pre-line text-ink-muted">{address || PLACEHOLDER}</p>
        </div>

        {groups.map((group) => (
          <div key={group.id ?? group.title} className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">
              {group.title}
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              {(group.links ?? []).map((link) => (
                <li key={link.id ?? `${link.href}`}>
                  <Link
                    href={localePath(locale, link.href ?? '/')}
                    className="text-ink-muted hover:text-indigo-700"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">Contact</p>
          <ul className="flex flex-col gap-2 text-sm text-ink-muted">
            {email ? (
              <li>
                <a href={`mailto:${email}`} className="hover:text-indigo-700">{email}</a>
              </li>
            ) : null}
            {phone ? (
              <li>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-indigo-700">{phone}</a>
              </li>
            ) : null}
            {!email && !phone ? <li>{PLACEHOLDER}</li> : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-sand-200">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-ink-muted">
          © {new Date().getFullYear()} {companyName}
        </div>
      </div>
    </footer>
  )
}
