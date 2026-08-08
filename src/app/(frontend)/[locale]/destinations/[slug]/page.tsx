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

const findDestination = async (slug: string, locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'destinations',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    locale,
    depth: 2,
  })
  return (docs[0] as any) ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug, locale } = await params
  const d = await findDestination(slug, locale)
  if (!d) return { title: 'Destination not found' }
  return buildMetadata({
    seo: d,
    fallbackTitle: `Jewish Heritage in ${d.name}`,
    fallbackDescription: d.shortDescription,
    path: `/destinations/${slug}`,
    locale,
  })
}

export default async function DestinationPage({ params }: Args) {
  const { slug, locale } = await params
  const d = await findDestination(slug, locale)
  if (!d) notFound()

  const payload = await getPayloadClient()
  const [{ docs: sites }, { docs: faqs }] = await Promise.all([
    payload.find({
      collection: 'heritage-sites',
      where: { destination: { equals: d.id }, _status: { equals: 'published' } },
      limit: 30,
      locale,
    }),
    payload.find({
      collection: 'faqs',
      where: { destination: { equals: d.id } },
      limit: 20,
      locale,
    }),
  ])

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Breadcrumbs
        locale={locale}
        baseUrl={baseUrl()}
        items={[
          { label: 'Home', href: '/' },
          { label: 'Destinations', href: '/destinations' },
          { label: d.name },
        ]}
      />
      <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold text-indigo-900 text-balance">
        {d.name}
      </h1>

      {d.heroImage?.url ? (
        <div className="relative mt-8 aspect-16/9 overflow-hidden rounded-lg">
          <Image
            src={d.heroImage.url}
            alt={d.heroImage.alt ?? ''}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-8">
        {d.overview ? <RichText data={d.overview} /> : null}

        {d.jewishHeritage ? (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
              Jewish heritage in {d.name}
            </h2>
            <div className="mt-3">
              <RichText data={d.jewishHeritage} />
            </div>
          </section>
        ) : null}

        {d.historicalSignificance ? (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
              Historical significance
            </h2>
            <div className="mt-3">
              <RichText data={d.historicalSignificance} />
            </div>
          </section>
        ) : null}

        {sites.length ? (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
              Heritage sites here
            </h2>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {sites.map((s: any) => (
                <li key={s.id}>
                  <Link
                    href={localePath(locale, `/jewish-heritage-sites/${s.slug}`)}
                    className="block rounded-lg border border-sand-200 bg-white px-5 py-3 text-indigo-900 transition-colors hover:border-brass"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {faqs.length ? (
          <section className="flex flex-col gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
              Questions
            </h2>
            {faqs.map((faq: any) => (
              <details key={faq.id} className="rounded-lg border border-sand-200 bg-white px-5 py-4">
                <summary className="cursor-pointer font-medium text-indigo-900">
                  {faq.question}
                </summary>
                <div className="mt-3">
                  <RichText data={faq.answer} />
                </div>
              </details>
            ))}
          </section>
        ) : null}
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Place',
          name: d.name,
          url: `${baseUrl()}${localePath(locale, `/destinations/${slug}`)}`,
          address: { '@type': 'PostalAddress', addressLocality: d.name, addressCountry: 'MA' },
        }}
      />
    </div>
  )
}
