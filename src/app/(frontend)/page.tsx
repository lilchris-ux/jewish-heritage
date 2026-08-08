import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

// Rendered on demand and cached; CMS edits purge the cache via revalidation
// hooks added in a later stage.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const payload = await getPayload({ config })
  const { docs: tours, totalDocs } = await payload.find({
    collection: 'tours',
    where: { _status: { equals: 'published' } },
    limit: 3,
    depth: 1,
  })

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
          Heritage travel in Morocco
        </p>
        <h1 className="max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold text-indigo-900 text-balance">
          Journeys through Morocco&rsquo;s Jewish heritage
        </h1>
        <p className="max-w-xl text-ink-muted">
          [PLACEHOLDER — client to supply the introduction describing the company and its
          approach to Jewish heritage travel.]
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-indigo-900">
          Tours
        </h2>
        {totalDocs === 0 ? (
          <p className="rounded-lg border border-dashed border-sand-200 bg-sand-100 px-5 py-8 text-ink-muted">
            No published tours yet. Create one in{' '}
            <Link href="/admin" className="text-indigo-700 underline">
              the admin panel
            </Link>{' '}
            and it will appear here.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour) => (
              <li key={tour.id}>
                <Link
                  href={`/tours/${tour.slug}`}
                  className="flex h-full flex-col gap-2 rounded-lg border border-sand-200 bg-white p-5 transition-colors hover:border-brass"
                >
                  <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-indigo-900">
                    {tour.title}
                  </span>
                  {tour.shortDescription ? (
                    <span className="text-sm text-ink-muted">{tour.shortDescription}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
