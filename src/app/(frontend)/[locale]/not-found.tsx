import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">404</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold text-indigo-900 text-balance">
        We couldn&rsquo;t find that page
      </h1>
      <p className="mt-4 text-ink-muted">
        The page may have moved, or the link may be out of date.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-indigo-700 px-6 py-3 text-sm font-semibold text-sand-50"
      >
        Back to the homepage
      </Link>
    </div>
  )
}
