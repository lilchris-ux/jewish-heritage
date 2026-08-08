'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitInquiry, type InquiryState } from '../actions/submitInquiry'
import { track } from '../lib/tracking'

const INTERESTS = [
  { value: 'synagogues', label: 'Synagogues' },
  { value: 'cemeteries', label: 'Jewish cemeteries' },
  { value: 'rabbinical-tombs', label: 'Rabbinical tombs' },
  { value: 'mellahs', label: 'Mellahs and Jewish quarters' },
  { value: 'family-roots', label: 'Family or ancestral roots' },
  { value: 'culture', label: 'Food and culture' },
]

const field =
  'w-full rounded-md border border-sand-200 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
const label = 'flex flex-col gap-1.5 text-sm font-medium text-ink'

export function InquiryForm({
  tourId,
  tourTitle,
}: {
  tourId?: string | number
  tourTitle?: string
}) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, {
    status: 'idle',
  })
  const [renderedAt] = useState(() => String(Date.now()))
  const started = useRef(false)

  useEffect(() => {
    if (state.status === 'success') track('inquiry_submit', { tour: tourTitle })
  }, [state.status, tourTitle])

  if (state.status === 'success') {
    return (
      <div className="rounded-lg border border-sand-200 bg-white p-6">
        <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-indigo-900">
          Thank you — your inquiry has been sent.
        </h3>
        <p className="mt-2 text-ink-muted">
          We will be in touch by email. If you would like a faster reply, message us on WhatsApp.
        </p>
      </div>
    )
  }

  return (
    <form
      action={action}
      onFocus={() => {
        if (!started.current) {
          started.current = true
          track('inquiry_start', { tour: tourTitle })
        }
      }}
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="renderedAt" value={renderedAt} />
      {tourId ? <input type="hidden" name="tourInterest" value={String(tourId)} /> : null}
      <AttributionFields />

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={label}>
          Full name *
          <input name="fullName" required className={field} autoComplete="name" />
          <FieldError state={state} name="fullName" />
        </label>
        <label className={label}>
          Email *
          <input name="email" type="email" required className={field} autoComplete="email" />
          <FieldError state={state} name="email" />
        </label>
        <label className={label}>
          Country
          <input name="country" className={field} autoComplete="country-name" />
        </label>
        <label className={label}>
          WhatsApp or phone
          <input name="phone" className={field} autoComplete="tel" />
        </label>
        <label className={label}>
          Preferred travel dates
          <input name="preferredDates" className={field} placeholder="e.g. April 2027" />
        </label>
        <label className={label}>
          Number of travellers
          <input name="travellers" type="number" min={1} max={100} className={field} />
        </label>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">Areas of interest</legend>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {INTERESTS.map((i) => (
            <label key={i.value} className="flex items-center gap-2 text-sm text-ink-muted">
              <input type="checkbox" name="interests" value={i.value} className="accent-indigo-700" />
              {i.label}
            </label>
          ))}
        </div>
      </fieldset>

      <label className={label}>
        Anything else we should know?
        <textarea name="message" rows={4} className={field} />
      </label>

      <label className="flex items-start gap-2 text-sm text-ink-muted">
        <input type="checkbox" name="consent" required className="mt-1 accent-indigo-700" />
        <span>
          I agree to my details being used to respond to this inquiry. *
          <FieldError state={state} name="consent" />
        </span>
      </label>

      {state.status === 'error' && state.message ? (
        <p role="alert" className="text-sm text-terracotta">
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-indigo-700 px-6 py-3 text-sm font-semibold text-sand-50 transition-colors hover:bg-indigo-900 disabled:opacity-60"
      >
        {pending ? 'Sending…' : 'Request an itinerary'}
      </button>
    </form>
  )
}

function FieldError({ state, name }: { state: InquiryState; name: string }) {
  const error = state.fieldErrors?.[name]
  if (!error) return null
  return <span className="text-xs font-normal text-terracotta">{error}</span>
}

/** Captures campaign attribution so a booking can be traced to its source. */
function AttributionFields() {
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setValues({
      sourcePage: window.location.pathname,
      referrer: document.referrer,
      utmSource: params.get('utm_source') ?? '',
      utmMedium: params.get('utm_medium') ?? '',
      utmCampaign: params.get('utm_campaign') ?? '',
      utmTerm: params.get('utm_term') ?? '',
      utmContent: params.get('utm_content') ?? '',
    })
  }, [])

  return (
    <>
      {Object.entries(values).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
    </>
  )
}
