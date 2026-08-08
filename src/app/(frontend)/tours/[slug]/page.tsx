import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

type Args = { params: Promise<{ slug: string }> }

const findTour = async (slug: string) => {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'tours',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const tour = await findTour(slug)
  if (!tour) return { title: 'Tour not found' }

  // CMS values win; the document's own fields are the fallback, so a title is
  // never empty even when the SEO tab is untouched.
  return {
    title: tour.metaTitle || tour.title,
    description: tour.metaDescription || tour.shortDescription || undefined,
    robots: tour.noindex ? { index: false, follow: false } : undefined,
  }
}

export default async function TourPage({ params }: Args) {
  const { slug } = await params
  const tour = await findTour(slug)
  if (!tour) notFound()

  const price =
    tour.showPrice && typeof tour.priceFrom === 'number'
      ? `From ${tour.priceFrom.toLocaleString('en-US', {
          style: 'currency',
          currency: tour.currency ?? 'USD',
          maximumFractionDigits: 0,
        })}`
      : 'Request a quote'

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold text-indigo-900 text-balance">
          {tour.title}
        </h1>
        {tour.shortDescription ? (
          <p className="max-w-2xl text-lg text-ink-muted">{tour.shortDescription}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full bg-indigo-900 px-3 py-1 font-semibold text-sand-50">
            {price}
          </span>
          {tour.availabilityStatus ? (
            <span className="rounded-full border border-sand-200 px-3 py-1 text-ink-muted capitalize">
              {String(tour.availabilityStatus).replace('-', ' ')}
            </span>
          ) : null}
          {tour.durationDays ? (
            <span className="text-ink-muted">{tour.durationDays} days</span>
          ) : null}
        </div>
        {tour.seasonalNote ? (
          <p className="text-sm text-terracotta">{tour.seasonalNote}</p>
        ) : null}
      </header>

      {Array.isArray(tour.highlights) && tour.highlights.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
            Highlights
          </h2>
          <ul className="flex list-disc flex-col gap-1 ps-5 text-ink-muted">
            {tour.highlights.map((h) => (
              <li key={h.id ?? h.text}>{h.text}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {Array.isArray(tour.itinerary) && tour.itinerary.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
            Itinerary
          </h2>
          <ol className="flex flex-col gap-4">
            {tour.itinerary.map((day) => (
              <li
                key={day.id ?? day.dayNumber}
                className="rounded-lg border border-sand-200 bg-white p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">
                  Day {day.dayNumber}
                </p>
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-indigo-900">
                  {day.title}
                </p>
                {day.overnightIn ? (
                  <p className="mt-1 text-sm text-ink-muted">Overnight in {day.overnightIn}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </article>
  )
}
