import type { Metadata } from 'next'
import { getPayloadClient } from '../../../lib/payload'
import { getSiteSettings } from '../../../lib/site'
import { RenderBlocks } from '../../../components/blocks/RenderBlocks'
import { StickyMobileBar } from '../../../components/StickyMobileBar'
import { buildMetadata } from '../../../lib/metadata'
import { whatsappHref } from '../../../lib/whatsapp'
import { localePath, type Locale } from '../../../lib/i18n'
import { PLACEHOLDER } from '../../../lib/site'

export const revalidate = 3600

const getHome = async (locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' }, _status: { equals: 'published' } },
    limit: 1,
    locale,
    depth: 2,
  })
  return docs[0] ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const [home, settings] = await Promise.all([getHome(locale), getSiteSettings(locale)])
  return buildMetadata({
    seo: home as never,
    fallbackTitle: settings?.defaultMetaTitle || 'Jewish Heritage Tours in Morocco',
    fallbackDescription:
      settings?.defaultMetaDescription ||
      'Guided Jewish heritage journeys through Morocco — synagogues, mellahs, cemeteries and the communities that shaped them.',
    path: '/',
    locale,
  })
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const [home, settings] = await Promise.all([getHome(locale), getSiteSettings(locale)])
  const whatsapp = whatsappHref(settings?.whatsappNumber, settings?.whatsappMessage)

  return (
    <>
      {home?.layout?.length ? (
        <RenderBlocks blocks={home.layout as never} ctx={{ locale, whatsapp }} />
      ) : (
        <div className="mx-auto max-w-6xl px-6 py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
            Heritage travel in Morocco
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold text-indigo-900 text-balance sm:text-5xl">
            Journeys through Morocco&rsquo;s Jewish heritage
          </h1>
          <p className="mt-5 max-w-xl text-ink-muted">{PLACEHOLDER}</p>
          <p className="mt-8 rounded-lg border border-dashed border-sand-200 bg-sand-100 px-5 py-6 text-sm text-ink-muted">
            No homepage has been built yet. In the admin panel, create a page with the slug{' '}
            <code className="rounded bg-white px-1.5 py-0.5">home</code>, add blocks to it, and
            publish — this page will render them.
          </p>
        </div>
      )}
      <StickyMobileBar whatsapp={whatsapp} contactHref={localePath(locale, '/contact')} />
    </>
  )
}
