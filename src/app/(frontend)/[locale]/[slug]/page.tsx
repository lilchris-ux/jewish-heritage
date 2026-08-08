import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '../../../../lib/payload'
import { getSiteSettings, baseUrl } from '../../../../lib/site'
import { buildMetadata } from '../../../../lib/metadata'
import { RenderBlocks } from '../../../../components/blocks/RenderBlocks'
import { StickyMobileBar } from '../../../../components/StickyMobileBar'
import { Breadcrumbs } from '../../../../components/Breadcrumbs'
import { whatsappHref } from '../../../../lib/whatsapp'
import { localePath, type Locale } from '../../../../lib/i18n'

export const revalidate = 3600

type Args = { params: Promise<{ locale: Locale; slug: string }> }

// Reserved by dedicated routes above; never resolve them from the CMS.
const RESERVED = new Set([
  'tours',
  'destinations',
  'jewish-heritage-sites',
  'travel-guide',
  'faq',
  'contact',
  'inquiry',
  'home',
])

const findPage = async (slug: string, locale: Locale) => {
  if (RESERVED.has(slug)) return null
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    locale,
    depth: 2,
  })
  return (docs[0] as any) ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug, locale } = await params
  const page = await findPage(slug, locale)
  if (!page) return { title: 'Page not found' }
  return buildMetadata({
    seo: page,
    fallbackTitle: page.title,
    path: `/${slug}`,
    locale,
  })
}

export default async function CmsPage({ params }: Args) {
  const { slug, locale } = await params
  const page = await findPage(slug, locale)
  if (!page) notFound()

  const settings = await getSiteSettings(locale)
  const whatsapp = whatsappHref(settings?.whatsappNumber, settings?.whatsappMessage)

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pt-12">
        <Breadcrumbs
          locale={locale}
          baseUrl={baseUrl()}
          items={[{ label: 'Home', href: '/' }, { label: page.title }]}
        />
      </div>
      {page.layout?.length ? (
        <RenderBlocks blocks={page.layout} ctx={{ locale, whatsapp }} />
      ) : (
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-indigo-900 text-balance">
            {page.title}
          </h1>
        </div>
      )}
      <StickyMobileBar whatsapp={whatsapp} contactHref={localePath(locale, '/contact')} />
    </>
  )
}
