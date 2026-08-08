'use client'

import Link from 'next/link'
import { WhatsAppLink } from './WhatsAppLink'

/**
 * Always-reachable conversion path on mobile, kept out of the way of content.
 */
export function StickyMobileBar({
  whatsapp,
  contactHref,
  context,
}: {
  whatsapp: string | null
  contactHref: string
  context?: string
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-sand-200 bg-sand-50/95 p-3 backdrop-blur md:hidden">
      <div className="flex gap-2">
        <Link
          href={contactHref}
          className="flex-1 rounded-md bg-indigo-700 px-4 py-3 text-center text-sm font-semibold text-sand-50"
        >
          Request itinerary
        </Link>
        {whatsapp ? (
          <WhatsAppLink
            href={whatsapp}
            placement="sticky-mobile-bar"
            context={context}
            className="flex-1 rounded-md border border-indigo-700 px-4 py-3 text-center text-sm font-semibold text-indigo-700"
          >
            WhatsApp
          </WhatsAppLink>
        ) : null}
      </div>
    </div>
  )
}
