import type { Metadata } from 'next'
import { getPayloadClient } from '../../../../lib/payload'
import { buildMetadata } from '../../../../lib/metadata'
import { RichText } from '../../../../components/RichText'
import { Breadcrumbs } from '../../../../components/Breadcrumbs'
import { JsonLd } from '../../../../components/JsonLd'
import { baseUrl } from '../../../../lib/site'
import type { Locale } from '../../../../lib/i18n'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    fallbackTitle: 'Frequently Asked Questions',
    fallbackDescription: 'Common questions about travelling with us in Morocco.',
    path: '/faq',
    locale,
  })
}

export default async function FaqPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const payload = await getPayloadClient()
  const { docs: faqs } = await payload.find({
    collection: 'faqs',
    where: { scope: { in: ['general', 'booking'] } },
    limit: 100,
    locale,
    sort: 'order',
  })

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs
        locale={locale}
        baseUrl={baseUrl()}
        items={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]}
      />
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-indigo-900 text-balance">
        Frequently Asked Questions
      </h1>

      {faqs.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-sand-200 bg-sand-100 px-5 py-8 text-ink-muted">
          No FAQs published yet.
        </p>
      ) : (
        <div className="mt-10 flex flex-col gap-2">
          {faqs.map((faq: any) => (
            <details key={faq.id} className="rounded-lg border border-sand-200 bg-white px-5 py-4">
              <summary className="cursor-pointer font-medium text-indigo-900">
                {faq.question}
              </summary>
              <div className="mt-3">
                <RichText data={faq.answer} />
              </div>
            </details>
          ))}
        </div>
      )}

      {faqs.length ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((f: any) => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.question },
            })),
          }}
        />
      ) : null}
    </div>
  )
}
