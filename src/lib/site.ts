import { getPayloadClient } from './payload'
import type { Locale } from './i18n'

export const getSiteSettings = async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'site-settings', locale, depth: 1 })
}

export const getNavigation = async (locale: Locale) => {
  const payload = await getPayloadClient()
  return payload.findGlobal({ slug: 'navigation', locale, depth: 0 })
}

export const baseUrl = (): string =>
  (process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** Placeholder marker shown wherever the client has not supplied real content. */
export const PLACEHOLDER = '[PLACEHOLDER — client to supply]'
