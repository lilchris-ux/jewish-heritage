import type { Metadata } from 'next'
import Link from 'next/link'
import './styles.css'

export const metadata: Metadata = {
  title: {
    default: 'Jewish Heritage Morocco',
    template: '%s · Jewish Heritage Morocco',
  },
  description:
    'Guided Jewish heritage journeys through Morocco — synagogues, mellahs, cemeteries and the communities that shaped them.',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen bg-sand-50 text-ink">
        <header className="border-b border-sand-200 bg-sand-100">
          <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-5">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-lg font-semibold text-indigo-900"
            >
              Jewish Heritage Morocco
            </Link>
            <nav className="flex gap-6 text-sm">
              <Link href="/tours" className="text-ink-muted hover:text-indigo-700">
                Tours
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-12">{children}</main>
        <footer className="mt-16 border-t border-sand-200 bg-sand-100">
          <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-ink-muted">
            [PLACEHOLDER — client to supply company details, contact information and legal pages]
          </div>
        </footer>
      </body>
    </html>
  )
}
