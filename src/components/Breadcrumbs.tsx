import Link from 'next/link'
import { JsonLd } from './JsonLd'
import { localePath, type Locale } from '../lib/i18n'

export type Crumb = { label: string; href?: string }

export function Breadcrumbs({
  items,
  locale,
  baseUrl,
}: {
  items: Crumb[]
  locale: Locale
  baseUrl: string
}) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-ink-muted">
          {items.map((item, i) => (
            <li key={`${item.label}-${i}`} className="flex items-center gap-2">
              {i > 0 ? <span aria-hidden="true" className="text-sand-200">/</span> : null}
              {item.href ? (
                <Link href={localePath(locale, item.href)} className="hover:text-indigo-700">
                  {item.label}
                </Link>
              ) : (
                <span aria-current="page" className="text-ink">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: `${baseUrl}${localePath(locale, item.href)}` } : {}),
          })),
        }}
      />
    </>
  )
}
