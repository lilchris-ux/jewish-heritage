import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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
    fallbackTitle: 'Destinations in Morocco',
    fallbackDescription:
      'The Moroccan cities and regions where we run Jewish heritage journeys.',
    path: '/destinations',
    locale,
  })
}

export default async function DestinationsIndex({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'destinations',
    where: { _status: { equals: 'published' } },
    limit: 60,
    locale,
    depth: 1,
  })

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumbs
        locale={locale}
        baseUrl={baseUrl()}
        items={[{ label: 'Home', href: '/' }, { label: 'Destinations' }]}
      />
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-indigo-900 text-balance">
        Destinations
      </h1>
      {docs.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-sand-200 bg-sand-100 px-5 py-8 text-ink-muted">
          No published destinations yet.
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((d: any) => (
            <li key={d.id}>
              <Link
                href={localePath(locale, `/destinations/${d.slug}`)}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-sand-200 bg-white transition-colors hover:border-brass"
              >
                {d.heroImage?.url ? (
                  <div className="relative aspect-3/2">
                    <Image
                      src={d.heroImage.url}
                      alt={d.heroImage.alt ?? ''}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex flex-col gap-2 p-5">
                  <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-indigo-900">
                    {d.name}
                  </span>
                  {d.shortDescription ? (
                    <span className="text-sm text-ink-muted">{d.shortDescription}</span>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
