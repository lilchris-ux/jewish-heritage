import { getPayload } from 'payload'
import config from '@payload-config'
import type { Locale } from './i18n'

export const getPayloadClient = async () => getPayload({ config })

/** Payload expects `false` rather than a locale when fallback is disabled. */
export type QueryLocale = Locale
