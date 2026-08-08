import type { Metadata } from 'next'
import Link from 'next/link'
import { localePath, type Locale } from '../../../../../lib/i18n'

// A clean URL for conversion pixels to fire on.
export const metadata: Metadata = {
  title: 'Thank you',
  robots: { index: false, follow: false },
}

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-indigo-900 text-balance">
        Thank you — your inquiry is on its way.
      </h1>
      <p className="mt-4 text-ink-muted">
        We will reply by email shortly. If you would like a faster answer, message us on WhatsApp.
      </p>
      <Link
        href={localePath(locale, '/')}
        className="mt-8 inline-block rounded-md bg-indigo-700 px-6 py-3 text-sm font-semibold text-sand-50"
      >
        Back to the homepage
      </Link>
    </div>
  )
}
