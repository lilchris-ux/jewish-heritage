import type { Metadata } from 'next'
import { LOCALES, DEFAULT_LOCALE, localePath, type Locale } from './i18n'
import { baseUrl } from './site'

type SeoInput = {
  metaTitle?: string | null
  metaDescription?: string | null
  noindex?: boolean | null
  ogImage?: { url?: string | null } | number | null
}

/**
 * Builds page metadata from CMS values, falling back to the document's own
 * title and description so a page is never published with an empty or
 * duplicated <title>. Also emits hreflang alternates for all three locales.
 */
export const buildMetadata = ({
  seo,
  fallbackTitle,
  fallbackDescription,
  path,
  locale,
}: {
  seo?: SeoInput | null
  fallbackTitle: string
  fallbackDescription?: string | null
  path: string
  locale: Locale
}): Metadata => {
  const title = seo?.metaTitle || fallbackTitle
  const description = seo?.metaDescription || fallbackDescription || undefined
  const url = `${baseUrl()}${localePath(locale, path)}`

  const languages: Record<string, string> = {}
  for (const l of LOCALES) languages[l] = `${baseUrl()}${localePath(l, path)}`
  languages['x-default'] = `${baseUrl()}${localePath(DEFAULT_LOCALE, path)}`

  const ogImage =
    seo?.ogImage && typeof seo.ogImage === 'object' && seo.ogImage.url ? seo.ogImage.url : undefined

  return {
    title,
    description,
    alternates: { canonical: url, languages },
    robots: seo?.noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  }
}
