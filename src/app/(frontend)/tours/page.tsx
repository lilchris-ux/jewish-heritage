import type { Metadata } from 'next'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Jewish Heritage Tours in Morocco',
  description:
    'Guided and private Jewish heritage tours across Morocco, visiting synagogues, mellahs, cemeteries and rabbinical tombs.',
}

export default async function ToursPage() {
  const payload = await getPayload({ config })
  const { docs: tours } = await payload.find({
    collection: 'tours',
    where: { _status: { equals: 'published' } },
    limit: 50,
    depth: 1,
  })

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-indigo-900">
        Jewish Heritage Tours
      </h1>
      {tours.length === 0 ? (
        <p className="rounded-lg border border-dashed border-sand-200 bg-sand-100 px-5 py-8 text-ink-muted">
          No published tours yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {tours.map((tour) => (
            <li key={tour.id}>
              <Link
                href={`/tours/${tour.slug}`}
                className="flex flex-col gap-2 rounded-lg border border-sand-200 bg-white p-6 transition-colors hover:border-brass"
              >
                <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-indigo-900">
                  {tour.title}
                </span>
                {tour.shortDescription ? (
                  <span className="text-ink-muted">{tour.shortDescription}</span>
                ) : null}
                <span className="flex flex-wrap gap-3 text-xs text-ink-muted">
                  {tour.durationDays ? <span>{tour.durationDays} days</span> : null}
                  {tour.tourType ? <span className="capitalize">{tour.tourType}</span> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
