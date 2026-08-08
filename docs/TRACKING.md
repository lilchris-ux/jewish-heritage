# Conversion tracking

The site is instrumented but owns no analytics account. Every event is pushed
to `window.dataLayer`, so a marketing agency can turn any of them into a
conversion inside their own Google Tag Manager container without a code change.

## Turning it on

Set a GTM container ID in either place — the CMS value wins:

- **CMS** — Site Settings → Analytics → GTM container ID (super admin only)
- **Environment** — `NEXT_PUBLIC_GTM_ID`

While both are empty, no tracking script loads at all.

## Events

| Event | Fires when | Payload |
|---|---|---|
| `whatsapp_click` | Any WhatsApp button is clicked | `placement`, `context` |
| `inquiry_start` | The visitor focuses the inquiry form for the first time | `tour` |
| `inquiry_submit` | An inquiry is accepted | `tour` |
| `tour_view` | A tour page is viewed | `tour`, `slug` |
| `phone_click` | A `tel:` link is clicked | `placement` |
| `email_click` | A `mailto:` link is clicked | `placement` |
| `booking_request` | A booking-intent action is taken | `tour` |
| `consultation_request` | A consultation is requested | — |

`placement` identifies where on the page the click happened — `header`,
`tour-sidebar`, `sticky-mobile-bar`, `cta-banner`, `contact-sidebar` — so the
agency can see which positions actually convert.

## Attribution

Every inquiry stores the campaign that produced it. On submission the form
captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`,
the referrer and the source page, and saves them on the inquiry record. They
are visible in the CMS under **Attribution** on each inquiry, which lets a
booking be traced back to a campaign with no extra tooling.

## Thank-you URL

Successful submissions can be routed to `/inquiry/thank-you`, a clean,
`noindex` URL that conversion pixels can fire on.

## Adding an event

```ts
import { track } from '@/lib/tracking'

track('booking_request', { tour: tour.title })
```

Add new names to the `TrackEvent` union in `src/lib/tracking.ts` so they stay
documented and type-checked.
