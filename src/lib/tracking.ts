/**
 * Conversion events pushed to the dataLayer. A marketing agency can turn any
 * of these into a conversion in their own GTM container without a code change.
 *
 * Documented for whoever inherits the site in docs/TRACKING.md.
 */
export type TrackEvent =
  | 'tour_view'
  | 'inquiry_start'
  | 'inquiry_submit'
  | 'whatsapp_click'
  | 'phone_click'
  | 'email_click'
  | 'booking_request'
  | 'consultation_request'

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

export const track = (event: TrackEvent, payload: Record<string, unknown> = {}): void => {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push({ event, ...payload })
}
