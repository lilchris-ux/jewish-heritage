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
    fallbackTitle: 'Jewish Heritage Tours in Morocco',
    fallbackDescription:
      'Private and small-group Jewish heritage tours across Morocco, visiting synagogues, mellahs, cemeteries and rabbinical tombs.',
    path: '/tours',
    locale,
  })
}

export default async function ToursIndex({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const payload = await getPayloadClient()
  const { docs: tours } = await payload.find({
    collection: 'tours',
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
        items={[{ label: 'Home', href: '/' }, { label: 'Tours' }]}
      />
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-indigo-900 text-balance">
        Jewish Heritage Tours
      </h1>

      {tours.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-sand-200 bg-sand-100 px-5 py-8 text-ink-muted">
          No published tours yet. Create one in the admin panel and it will appear here.
        </p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour: any) => (
            <li key={tour.id}>
              <Link
                href={localePath(locale, `/tours/${tour.slug}`)}
                className="flex h-full flex-col overflow-hidden rounded-lg border border-sand-200 bg-white transition-colors hover:border-brass"
              >
                {tour.heroImage?.url ? (
                  <div className="relative aspect-3/2">
                    <Image
                      src={tour.heroImage.url}
                      alt={tour.heroImage.alt ?? ''}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-indigo-900">
                    {tour.title}
                  </span>
                  {tour.shortDescription ? (
                    <span className="text-sm text-ink-muted">{tour.shortDescription}</span>
                  ) : null}
                  <span className="mt-auto flex flex-wrap gap-3 pt-3 text-xs text-brass">
                    {tour.durationDays ? <span>{tour.durationDays} days</span> : null}
                    {tour.tourType ? <span className="capitalize">{tour.tourType}</span> : null}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
