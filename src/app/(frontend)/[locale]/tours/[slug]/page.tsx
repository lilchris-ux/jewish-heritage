import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '../../../../../lib/payload'
import { getSiteSettings, baseUrl } from '../../../../../lib/site'
import { buildMetadata } from '../../../../../lib/metadata'
import { whatsappHref } from '../../../../../lib/whatsapp'
import { RichText } from '../../../../../components/RichText'
import { Breadcrumbs } from '../../../../../components/Breadcrumbs'
import { WhatsAppLink } from '../../../../../components/WhatsAppLink'
import { InquiryForm } from '../../../../../components/InquiryForm'
import { StickyMobileBar } from '../../../../../components/StickyMobileBar'
import { JsonLd } from '../../../../../components/JsonLd'
import { localePath, type Locale } from '../../../../../lib/i18n'

export const revalidate = 3600

type Args = { params: Promise<{ locale: Locale; slug: string }> }

const findTour = async (slug: string, locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'tours',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    locale,
    depth: 2,
  })
  return (docs[0] as any) ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug, locale } = await params
  const tour = await findTour(slug, locale)
  if (!tour) return { title: 'Tour not found' }
  return buildMetadata({
    seo: tour,
    fallbackTitle: tour.title,
    fallbackDescription: tour.shortDescription,
    path: `/tours/${slug}`,
    locale,
  })
}

export default async function TourPage({ params }: Args) {
  const { slug, locale } = await params
  const tour = await findTour(slug, locale)
  if (!tour) notFound()

  const settings = await getSiteSettings(locale)
  const whatsapp = whatsappHref(settings?.whatsappNumber, settings?.whatsappMessage, tour.title)

  const payload = await getPayloadClient()
  const [{ docs: faqs }, { docs: departures }] = await Promise.all([
    payload.find({
      collection: 'faqs',
      where: { tour: { equals: tour.id } },
      limit: 20,
      locale,
    }),
    payload.find({
      collection: 'departures',
      where: { tour: { equals: tour.id }, status: { not_equals: 'cancelled' } },
      limit: 20,
      locale,
      sort: 'startDate',
    }),
  ])

  const price =
    tour.showPrice && typeof tour.priceFrom === 'number'
      ? `From ${tour.priceFrom.toLocaleString('en-US', {
          style: 'currency',
          currency: tour.currency ?? 'USD',
          maximumFractionDigits: 0,
        })}`
      : 'Request a quote'

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 py-12 pb-28 md:pb-12">
        <Breadcrumbs
          locale={locale}
          baseUrl={baseUrl()}
          items={[{ label: 'Home', href: '/' }, { label: 'Tours', href: '/tours' }, { label: tour.title }]}
        />

        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:items-start">
          <article className="flex flex-col gap-10">
            <header className="flex flex-col gap-4">
              <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold text-indigo-900 text-balance">
                {tour.title}
              </h1>
              {tour.shortDescription ? (
                <p className="max-w-2xl text-lg text-ink-muted">{tour.shortDescription}</p>
              ) : null}
              <div className="flex flex-wrap gap-3 text-sm text-ink-muted">
                {tour.durationDays ? <span>{tour.durationDays} days</span> : null}
                {tour.startLocation ? <span>Starts {tour.startLocation}</span> : null}
                {tour.endLocation ? <span>Ends {tour.endLocation}</span> : null}
              </div>
              {tour.seasonalNote ? (
                <p className="text-sm text-terracotta">{tour.seasonalNote}</p>
              ) : null}
            </header>

            {tour.heroImage?.url ? (
              <div className="relative aspect-16/9 overflow-hidden rounded-lg">
                <Image
                  src={tour.heroImage.url}
                  alt={tour.heroImage.alt ?? ''}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                />
              </div>
            ) : null}

            {tour.description ? <RichText data={tour.description} /> : null}

            {tour.highlights?.length ? (
              <section className="flex flex-col gap-3">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
                  Highlights
                </h2>
                <ul className="flex list-disc flex-col gap-1.5 ps-5 text-ink-muted">
                  {tour.highlights.map((h: any) => (
                    <li key={h.id ?? h.text}>{h.text}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {tour.itinerary?.length ? (
              <section className="flex flex-col gap-4">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
                  Itinerary
                </h2>
                <ol className="flex flex-col gap-3">
                  {tour.itinerary.map((day: any) => (
                    <li
                      key={day.id ?? day.dayNumber}
                      className="rounded-lg border border-sand-200 bg-white p-5"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">
                        Day {day.dayNumber}
                      </p>
                      <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-indigo-900">
                        {day.title}
                      </h3>
                      {day.description ? (
                        <div className="mt-2">
                          <RichText data={day.description} />
                        </div>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
                        {day.overnightIn ? <span>Overnight: {day.overnightIn}</span> : null}
                        {day.meals?.length ? <span>Meals: {day.meals.join(', ')}</span> : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {(tour.included?.length || tour.excluded?.length) ? (
              <section className="grid gap-8 sm:grid-cols-2">
                {tour.included?.length ? (
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-indigo-900">
                      What&rsquo;s included
                    </h2>
                    <ul className="mt-3 flex list-disc flex-col gap-1.5 ps-5 text-sm text-ink-muted">
                      {tour.included.map((i: any) => (
                        <li key={i.id ?? i.text}>{i.text}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {tour.excluded?.length ? (
                  <div>
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-indigo-900">
                      Not included
                    </h2>
                    <ul className="mt-3 flex list-disc flex-col gap-1.5 ps-5 text-sm text-ink-muted">
                      {tour.excluded.map((i: any) => (
                        <li key={i.id ?? i.text}>{i.text}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            ) : null}

            {departures.length ? (
              <section className="flex flex-col gap-3">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
                  Upcoming departures
                </h2>
                <ul className="flex flex-col gap-2">
                  {departures.map((d: any) => (
                    <li
                      key={d.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sand-200 bg-white px-5 py-3 text-sm"
                    >
                      <span className="text-ink">
                        {new Date(d.startDate).toLocaleDateString(locale, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                        {d.endDate
                          ? ` — ${new Date(d.endDate).toLocaleDateString(locale, {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}`
                          : ''}
                      </span>
                      <span className="text-xs text-brass capitalize">{d.status}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {faqs.length ? (
              <section className="flex flex-col gap-3">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
                  Questions about this tour
                </h2>
                <div className="flex flex-col gap-2">
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
                </div>
              </section>
            ) : null}

            <section id="inquire" className="flex flex-col gap-4 border-t border-sand-200 pt-10">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
                Request this itinerary
              </h2>
              <InquiryForm tourId={tour.id} tourTitle={tour.title} />
            </section>
          </article>

          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <div className="flex flex-col gap-4 rounded-lg border border-sand-200 bg-white p-6">
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
                {price}
              </p>
              {tour.priceNote ? <p className="text-xs text-ink-muted">{tour.priceNote}</p> : null}
              <p className="text-sm text-ink-muted capitalize">
                {String(tour.availabilityStatus ?? '').replace(/-/g, ' ')}
              </p>
              <a
                href="#inquire"
                className="rounded-md bg-indigo-700 px-5 py-3 text-center text-sm font-semibold text-sand-50 transition-colors hover:bg-indigo-900"
              >
                Request an itinerary
              </a>
              {whatsapp ? (
                <WhatsAppLink
                  href={whatsapp}
                  placement="tour-sidebar"
                  context={tour.title}
                  className="rounded-md border border-indigo-700 px-5 py-3 text-center text-sm font-semibold text-indigo-700 transition-colors hover:bg-sand-100"
                >
                  Ask on WhatsApp
                </WhatsAppLink>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      <StickyMobileBar
        whatsapp={whatsapp}
        contactHref={localePath(locale, `/tours/${slug}#inquire`)}
        context={tour.title}
      />

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'TouristTrip',
          name: tour.title,
          description: tour.shortDescription ?? undefined,
          url: `${baseUrl()}${localePath(locale, `/tours/${slug}`)}`,
          ...(tour.showPrice && typeof tour.priceFrom === 'number'
            ? {
                offers: {
                  '@type': 'Offer',
                  price: tour.priceFrom,
                  priceCurrency: tour.currency ?? 'USD',
                },
              }
            : {}),
          ...(faqs.length
            ? {
                subjectOf: {
                  '@type': 'FAQPage',
                  mainEntity: faqs.map((f: any) => ({
                    '@type': 'Question',
                    name: f.question,
                  })),
                },
              }
            : {}),
        }}
      />
    </>
  )
}
