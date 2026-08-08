import type { Metadata } from 'next'
import { getSiteSettings, baseUrl, PLACEHOLDER } from '../../../../lib/site'
import { buildMetadata } from '../../../../lib/metadata'
import { InquiryForm } from '../../../../components/InquiryForm'
import { WhatsAppLink } from '../../../../components/WhatsAppLink'
import { Breadcrumbs } from '../../../../components/Breadcrumbs'
import { whatsappHref } from '../../../../lib/whatsapp'
import type { Locale } from '../../../../lib/i18n'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    fallbackTitle: 'Contact & Trip Enquiries',
    fallbackDescription:
      'Tell us what you would like to see in Morocco and we will build an itinerary around it.',
    path: '/contact',
    locale,
  })
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const settings = await getSiteSettings(locale)
  const whatsapp = whatsappHref(settings?.whatsappNumber, settings?.whatsappMessage)

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-28 md:pb-12">
      <Breadcrumbs
        locale={locale}
        baseUrl={baseUrl()}
        items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-indigo-900 text-balance">
        Plan your journey
      </h1>
      <p className="mt-3 max-w-2xl text-ink-muted">
        Tell us what you would like to see and how you like to travel, and we will put together an
        itinerary.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_18rem] lg:items-start">
        <InquiryForm />

        <aside className="flex flex-col gap-4 rounded-lg border border-sand-200 bg-white p-6 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">Email</p>
            <p className="mt-1">
              {settings?.email ? (
                <a href={`mailto:${settings.email}`} className="text-indigo-700 underline">
                  {settings.email}
                </a>
              ) : (
                <span className="text-ink-muted">{PLACEHOLDER}</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brass">Phone</p>
            <p className="mt-1">
              {settings?.phone ? (
                <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="text-indigo-700 underline">
                  {settings.phone}
                </a>
              ) : (
                <span className="text-ink-muted">{PLACEHOLDER}</span>
              )}
            </p>
          </div>
          {whatsapp ? (
            <WhatsAppLink
              href={whatsapp}
              placement="contact-sidebar"
              className="rounded-md bg-indigo-700 px-5 py-3 text-center font-semibold text-sand-50 transition-colors hover:bg-indigo-900"
            >
              Message on WhatsApp
            </WhatsAppLink>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
