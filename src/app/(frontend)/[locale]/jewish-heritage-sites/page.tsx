import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayloadClient } from '../../../../lib/payload'
import { buildMetadata } from '../../../../lib/metadata'
import { Breadcrumbs } from '../../../../components/Breadcrumbs'
import { baseUrl } from '../../../../lib/site'
import { localePath, type Locale } from '../../../../lib/i18n'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    fallbackTitle: 'Jewish Heritage Sites in Morocco',
    fallbackDescription:
      'Synagogues, mellahs, Jewish cemeteries and rabbinical tombs across Morocco, and the communities connected to them.',
    path: '/jewish-heritage-sites',
    locale,
  })
}

export default async function SitesIndex({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const payload = await getPayloadClient()
  const { docs: sites } = await payload.find({
    collection: 'heritage-sites',
    where: { _status: { equals: 'published' } },
    limit: 100,
    locale,
    depth: 1,
  })

  const grouped = sites.reduce<Record<string, any[]>>((acc, site: any) => {
    const key = site.siteType ?? 'other'
    ;(acc[key] ??= []).push(site)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs
        locale={locale}
        baseUrl={baseUrl()}
        items={[{ label: 'Home', href: '/' }, { label: 'Heritage sites' }]}
      />
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-indigo-900 text-balance">
        Jewish Heritage Sites in Morocco
      </h1>

      {sites.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-sand-200 bg-sand-100 px-5 py-8 text-ink-muted">
          No published heritage sites yet.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-10">
          {Object.entries(grouped).map(([type, items]) => (
            <section key={type} className="flex flex-col gap-4">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900 capitalize">
                {type.replace(/-/g, ' ')}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((site) => (
                  <li key={site.id}>
                    <Link
                      href={localePath(locale, `/jewish-heritage-sites/${site.slug}`)}
                      className="flex h-full flex-col gap-1.5 rounded-lg border border-sand-200 bg-white p-5 transition-colors hover:border-brass"
                    >
                      <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-indigo-900">
                        {site.name}
                      </span>
                      {site.city ? (
                        <span className="text-sm text-ink-muted">{site.city}</span>
                      ) : null}
                      {site.shortDescription ? (
                        <span className="text-sm text-ink-muted">{site.shortDescription}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
