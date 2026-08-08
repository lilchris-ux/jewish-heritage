import type { MetadataRoute } from 'next'
import { baseUrl } from '../lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The CMS and the content API are never for crawlers.
        disallow: ['/admin', '/api', '/inquiry/thank-you'],
      },
    ],
    sitemap: `${baseUrl()}/sitemap.xml`,
  }
}
