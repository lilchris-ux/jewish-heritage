import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '../../../../../lib/payload'
import { buildMetadata } from '../../../../../lib/metadata'
import { RichText } from '../../../../../components/RichText'
import { Breadcrumbs } from '../../../../../components/Breadcrumbs'
import { JsonLd } from '../../../../../components/JsonLd'
import { baseUrl } from '../../../../../lib/site'
import { localePath, type Locale } from '../../../../../lib/i18n'

export const revalidate = 3600

type Args = { params: Promise<{ locale: Locale; slug: string }> }

const findSite = async (slug: string, locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'heritage-sites',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    locale,
    depth: 2,
  })
  return (docs[0] as any) ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug, locale } = await params
  const site = await findSite(slug, locale)
  if (!site) return { title: 'Heritage site not found' }
  return buildMetadata({
    seo: site,
    fallbackTitle: site.name,
    fallbackDescription: site.shortDescription,
    path: `/jewish-heritage-sites/${slug}`,
    locale,
  })
}

export default async function HeritageSitePage({ params }: Args) {
  const { slug, locale } = await params
  const site = await findSite(slug, locale)
  if (!site) notFound()

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Breadcrumbs
        locale={locale}
        baseUrl={baseUrl()}
        items={[
          { label: 'Home', href: '/' },
          { label: 'Heritage sites', href: '/jewish-heritage-sites' },
          { label: site.name },
        ]}
      />

      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass capitalize">
        {String(site.siteType ?? '').replace(/-/g, ' ')}
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold text-indigo-900 text-balance">
        {site.name}
      </h1>
      {site.city || site.region ? (
        <p className="mt-2 text-ink-muted">{[site.city, site.region].filter(Boolean).join(', ')}</p>
      ) : null}

      {site.images?.[0]?.url ? (
        <div className="relative mt-8 aspect-16/9 overflow-hidden rounded-lg">
          <Image
            src={site.images[0].url}
            alt={site.images[0].alt ?? ''}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-8">
        {site.description ? <RichText data={site.description} /> : null}

        {site.historicalInfo ? (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
              History
            </h2>
            <div className="mt-3">
              <RichText data={site.historicalInfo} />
            </div>
          </section>
        ) : null}

        {site.visitingInfo ? (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
              Visiting
            </h2>
            <div className="mt-3">
              <RichText data={site.visitingInfo} />
            </div>
          </section>
        ) : null}

        {site.historicalSources?.length ? (
          <section className="rounded-lg border border-sand-200 bg-sand-100 p-5">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">
              Sources
            </h2>
            <ul className="mt-3 flex list-disc flex-col gap-1.5 ps-5 text-sm text-ink-muted">
              {site.historicalSources.map((s: any) => (
                <li key={s.id ?? s.title}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-indigo-700 underline">
                      {s.title}
                    </a>
                  ) : (
                    s.title
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {site.relatedTours?.length ? (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
              Tours visiting this site
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {site.relatedTours.filter((t: any) => typeof t === 'object').map((tour: any) => (
                <li key={tour.id}>
                  <Link
                    href={localePath(locale, `/tours/${tour.slug}`)}
                    className="block rounded-lg border border-sand-200 bg-white px-5 py-3 text-indigo-900 transition-colors hover:border-brass"
                  >
                    {tour.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TouristAttraction',
          name: site.name,
          description: site.shortDescription ?? undefined,
          url: `${baseUrl()}${localePath(locale, `/jewish-heritage-sites/${slug}`)}`,
          ...(site.city
            ? { address: { '@type': 'PostalAddress', addressLocality: site.city, addressCountry: 'MA' } }
            : {}),
        }}
      />
    </div>
  )
}
