'use server'

import { z } from 'zod'
import { getPayloadClient } from '../lib/payload'

const InquirySchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your name.').max(120),
  email: z.string().trim().email('Please enter a valid email address.').max(200),
  country: z.string().trim().max(100).optional().or(z.literal('')),
  phone: z.string().trim().max(60).optional().or(z.literal('')),
  preferredDates: z.string().trim().max(120).optional().or(z.literal('')),
  travellers: z.coerce.number().int().min(1).max(100).optional(),
  tripDuration: z.string().trim().max(60).optional().or(z.literal('')),
  tripStyle: z.enum(['private', 'group', 'either']).optional(),
  interests: z.array(z.string()).optional(),
  message: z.string().trim().max(4000).optional().or(z.literal('')),
  tourInterest: z.string().optional().or(z.literal('')),
  consent: z.literal('on', { message: 'Please accept the privacy notice.' }),
  // Hidden anti-spam fields.
  company: z.string().max(0, 'Rejected.').optional().or(z.literal('')),
  renderedAt: z.string().optional(),
  // Attribution, captured client-side.
  sourcePage: z.string().max(500).optional().or(z.literal('')),
  referrer: z.string().max(500).optional().or(z.literal('')),
  utmSource: z.string().max(200).optional().or(z.literal('')),
  utmMedium: z.string().max(200).optional().or(z.literal('')),
  utmCampaign: z.string().max(200).optional().or(z.literal('')),
  utmTerm: z.string().max(200).optional().or(z.literal('')),
  utmContent: z.string().max(200).optional().or(z.literal('')),
})

export type InquiryState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

const notify = async (data: Record<string, unknown>) => {
  const key = process.env.RESEND_API_KEY
  const to = process.env.INQUIRY_NOTIFY_TO
  const from = process.env.EMAIL_FROM
  if (!key || !to || !from) return

  const rows = Object.entries(data)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${String(v)}</td></tr>`)
    .join('')

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        subject: `New inquiry — ${data.fullName ?? 'website'}`,
        html: `<h2>New travel inquiry</h2><table>${rows}</table>`,
      }),
    })
  } catch {
    // A failed notification must never lose the inquiry: it is already saved.
  }
}

export async function submitInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const raw = Object.fromEntries(formData.entries())
  const interests = formData.getAll('interests').map(String)
  const parsed = InquirySchema.safeParse({ ...raw, interests })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors }
  }

  const d = parsed.data

  // Honeypot: a real person never fills a hidden field.
  if (d.company) return { status: 'success' }

  // Time trap: submissions faster than three seconds are automated.
  const rendered = Number(d.renderedAt)
  if (Number.isFinite(rendered) && Date.now() - rendered < 3000) {
    return { status: 'success' }
  }

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'inquiries',
      // The collection denies public create; this validated server path is the
      // only way in, which keeps the REST endpoint closed to bots.
      overrideAccess: true,
      data: {
        status: 'new',
        fullName: d.fullName,
        email: d.email,
        country: d.country || undefined,
        phone: d.phone || undefined,
        preferredDates: d.preferredDates || undefined,
        travellers: d.travellers,
        tripDuration: d.tripDuration || undefined,
        tripStyle: d.tripStyle,
        interests: d.interests as never,
        message: d.message || undefined,
        tourInterest: d.tourInterest ? Number(d.tourInterest) || undefined : undefined,
        sourcePage: d.sourcePage || undefined,
        referrer: d.referrer || undefined,
        utmSource: d.utmSource || undefined,
        utmMedium: d.utmMedium || undefined,
        utmCampaign: d.utmCampaign || undefined,
        utmTerm: d.utmTerm || undefined,
        utmContent: d.utmContent || undefined,
      },
    })

    await notify(d as Record<string, unknown>)
    return { status: 'success' }
  } catch {
    return {
      status: 'error',
      message: 'Something went wrong sending your inquiry. Please try again, or reach us on WhatsApp.',
    }
  }
}
