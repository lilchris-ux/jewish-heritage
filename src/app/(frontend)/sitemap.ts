import type { MetadataRoute } from 'next'
import { getPayloadClient } from '../../lib/payload'
import { baseUrl } from '../../lib/site'
import { LOCALES, localePath, type Locale } from '../../lib/i18n'

export const revalidate = 3600

/** Emits every published URL in every locale, with hreflang alternates. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayloadClient()
  const base = baseUrl()

  const [tours, sites, destinations, posts, pages] = await Promise.all([
    payload.find({ collection: 'tours', where: { _status: { equals: 'published' } }, limit: 500, depth: 0 }),
    payload.find({ collection: 'heritage-sites', where: { _status: { equals: 'published' } }, limit: 500, depth: 0 }),
    payload.find({ collection: 'destinations', where: { _status: { equals: 'published' } }, limit: 500, depth: 0 }),
    payload.find({ collection: 'posts', where: { _status: { equals: 'published' } }, limit: 500, depth: 0 }),
    payload.find({ collection: 'pages', where: { _status: { equals: 'published' } }, limit: 500, depth: 0 }),
  ])

  const paths: { path: string; lastModified?: string }[] = [
    { path: '/' },
    { path: '/tours' },
    { path: '/jewish-heritage-sites' },
    { path: '/destinations' },
    { path: '/travel-guide' },
    { path: '/faq' },
    { path: '/contact' },
    ...tours.docs.map((d: any) => ({ path: `/tours/${d.slug}`, lastModified: d.updatedAt })),
    ...sites.docs.map((d: any) => ({ path: `/jewish-heritage-sites/${d.slug}`, lastModified: d.updatedAt })),
    ...destinations.docs.map((d: any) => ({ path: `/destinations/${d.slug}`, lastModified: d.updatedAt })),
    ...posts.docs.map((d: any) => ({ path: `/travel-guide/${d.slug}`, lastModified: d.updatedAt })),
    ...pages.docs
      .filter((d: any) => d.slug !== 'home')
      .map((d: any) => ({ path: `/${d.slug}`, lastModified: d.updatedAt })),
  ]

  return paths.flatMap(({ path, lastModified }) =>
    LOCALES.map((locale: Locale) => ({
      url: `${base}${localePath(locale, path)}`,
      lastModified: lastModified ? new Date(lastModified) : undefined,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, `${base}${localePath(l, path)}`]),
        ),
      },
    })),
  )
}
