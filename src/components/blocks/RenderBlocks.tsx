import Link from 'next/link'
import Image from 'next/image'
import { RichText } from '../RichText'
import { WhatsAppLink } from '../WhatsAppLink'
import { InquiryForm } from '../InquiryForm'
import { getPayloadClient } from '../../lib/payload'
import { localePath, type Locale } from '../../lib/i18n'

type Ctx = { locale: Locale; whatsapp: string | null }

const section = 'mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-14'
const h2 =
  'font-[family-name:var(--font-display)] text-3xl font-semibold text-indigo-900 text-balance'

const mediaUrl = (m: unknown): string | null =>
  m && typeof m === 'object' && 'url' in m ? ((m as { url?: string }).url ?? null) : null
const mediaAlt = (m: unknown): string =>
  m && typeof m === 'object' && 'alt' in m ? ((m as { alt?: string }).alt ?? '') : ''

export async function RenderBlocks({
  blocks,
  ctx,
}: {
  blocks: Record<string, unknown>[] | null | undefined
  ctx: Ctx
}) {
  if (!blocks?.length) return null
  return (
    <>
      {blocks.map((block, i) => (
        <Block key={`${block.blockType}-${i}`} block={block} ctx={ctx} />
      ))}
    </>
  )
}

async function Block({ block, ctx }: { block: Record<string, any>; ctx: Ctx }) {
  const payload = await getPayloadClient()

  switch (block.blockType) {
    case 'hero': {
      const url = mediaUrl(block.image)
      return (
        <section className="border-b border-sand-200 bg-sand-100">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              {block.eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass">
                  {block.eyebrow}
                </p>
              ) : null}
              <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold text-indigo-900 text-balance sm:text-5xl">
                {block.heading}
              </h1>
              {block.subheading ? (
                <p className="max-w-xl text-lg text-ink-muted">{block.subheading}</p>
              ) : null}
              {block.ctaLabel && block.ctaHref ? (
                <Link
                  href={localePath(ctx.locale, block.ctaHref)}
                  className="self-start rounded-md bg-indigo-700 px-6 py-3 text-sm font-semibold text-sand-50 transition-colors hover:bg-indigo-900"
                >
                  {block.ctaLabel}
                </Link>
              ) : null}
            </div>
            {url ? (
              <div className="relative aspect-4/3 overflow-hidden rounded-tl-[6rem] rounded-br-[6rem]">
                <Image
                  src={url}
                  alt={mediaAlt(block.image)}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>
        </section>
      )
    }

    case 'richText':
      return (
        <section className={section}>
          {block.heading ? <h2 className={h2}>{block.heading}</h2> : null}
          <RichText data={block.content} />
        </section>
      )

    case 'imageText': {
      const url = mediaUrl(block.image)
      return (
        <section className={`${section} lg:grid lg:grid-cols-2 lg:items-center lg:gap-12`}>
          <div className={block.imagePosition === 'start' ? 'lg:order-2' : ''}>
            {block.heading ? <h2 className={h2}>{block.heading}</h2> : null}
            <div className="mt-4">
              <RichText data={block.content} />
            </div>
          </div>
          {url ? (
            <div
              className={`relative mt-8 aspect-4/3 overflow-hidden rounded-lg lg:mt-0 ${
                block.imagePosition === 'start' ? 'lg:order-1' : ''
              }`}
            >
              <Image
                src={url}
                alt={mediaAlt(block.image)}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </section>
      )
    }

    case 'tourGrid': {
      const selected = (block.tours ?? []).filter((t: unknown) => typeof t === 'object')
      const tours = selected.length
        ? selected
        : (
            await payload.find({
              collection: 'tours',
              where: { _status: { equals: 'published' } },
              limit: block.limit ?? 3,
              locale: ctx.locale,
              depth: 1,
            })
          ).docs

      return (
        <section className={section}>
          {block.heading ? <h2 className={h2}>{block.heading}</h2> : null}
          {block.intro ? <p className="max-w-2xl text-ink-muted">{block.intro}</p> : null}
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((tour: any) => (
              <li key={tour.id}>
                <Link
                  href={localePath(ctx.locale, `/tours/${tour.slug}`)}
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-sand-200 bg-white transition-colors hover:border-brass"
                >
                  {mediaUrl(tour.heroImage) ? (
                    <div className="relative aspect-3/2">
                      <Image
                        src={mediaUrl(tour.heroImage) as string}
                        alt={mediaAlt(tour.heroImage)}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-indigo-900">
                      {tour.title}
                    </span>
                    {tour.shortDescription ? (
                      <span className="text-sm text-ink-muted">{tour.shortDescription}</span>
                    ) : null}
                    {tour.durationDays ? (
                      <span className="mt-auto pt-2 text-xs text-brass">
                        {tour.durationDays} days
                      </span>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )
    }

    case 'heritageGrid': {
      const selected = (block.sites ?? []).filter((s: unknown) => typeof s === 'object')
      const sites = selected.length
        ? selected
        : (
            await payload.find({
              collection: 'heritage-sites',
              where: { _status: { equals: 'published' } },
              limit: block.limit ?? 6,
              locale: ctx.locale,
              depth: 1,
            })
          ).docs

      return (
        <section className={section}>
          {block.heading ? <h2 className={h2}>{block.heading}</h2> : null}
          {block.intro ? <p className="max-w-2xl text-ink-muted">{block.intro}</p> : null}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site: any) => (
              <li key={site.id}>
                <Link
                  href={localePath(ctx.locale, `/jewish-heritage-sites/${site.slug}`)}
                  className="flex h-full flex-col gap-1.5 rounded-lg border border-sand-200 bg-white p-5 transition-colors hover:border-brass"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-brass">
                    {String(site.siteType ?? '').replace(/-/g, ' ')}
                  </span>
                  <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-indigo-900">
                    {site.name}
                  </span>
                  {site.city ? <span className="text-sm text-ink-muted">{site.city}</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )
    }

    case 'destinationGrid': {
      const selected = (block.destinations ?? []).filter((d: unknown) => typeof d === 'object')
      const destinations = selected.length
        ? selected
        : (
            await payload.find({
              collection: 'destinations',
              where: { _status: { equals: 'published' } },
              limit: block.limit ?? 6,
              locale: ctx.locale,
              depth: 1,
            })
          ).docs

      return (
        <section className={section}>
          {block.heading ? <h2 className={h2}>{block.heading}</h2> : null}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((d: any) => (
              <li key={d.id}>
                <Link
                  href={localePath(ctx.locale, `/destinations/${d.slug}`)}
                  className="flex h-full flex-col gap-1.5 rounded-lg border border-sand-200 bg-white p-5 transition-colors hover:border-brass"
                >
                  <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-indigo-900">
                    {d.name}
                  </span>
                  {d.shortDescription ? (
                    <span className="text-sm text-ink-muted">{d.shortDescription}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )
    }

    case 'faqAccordion': {
      const { docs: faqs } = await payload.find({
        collection: 'faqs',
        where: { scope: { equals: block.scope ?? 'general' } },
        limit: 25,
        locale: ctx.locale,
      })
      if (!faqs.length) return null
      return (
        <section className={section}>
          {block.heading ? <h2 className={h2}>{block.heading}</h2> : null}
          <div className="flex flex-col gap-2">
            {faqs.map((faq: any) => (
              <details
                key={faq.id}
                className="rounded-lg border border-sand-200 bg-white px-5 py-4"
              >
                <summary className="cursor-pointer font-medium text-indigo-900">
                  {faq.question}
                </summary>
                <div className="mt-3">
                  <RichText data={faq.answer} />
                </div>
              </details>
            ))}
          </div>
        </section>
      )
    }

    case 'ctaBanner':
      return (
        <section className="bg-indigo-900">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-6 py-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-sand-50 text-balance">
              {block.heading}
            </h2>
            {block.body ? <p className="max-w-2xl text-sand-200">{block.body}</p> : null}
            <div className="flex flex-wrap gap-3">
              {block.showInquiryButton !== false ? (
                <Link
                  href={localePath(ctx.locale, '/contact')}
                  className="rounded-md bg-sand-50 px-6 py-3 text-sm font-semibold text-indigo-900 transition-colors hover:bg-sand-200"
                >
                  Request an itinerary
                </Link>
              ) : null}
              {block.showWhatsAppButton !== false && ctx.whatsapp ? (
                <WhatsAppLink
                  href={ctx.whatsapp}
                  placement="cta-banner"
                  className="rounded-md border border-sand-200 px-6 py-3 text-sm font-semibold text-sand-50 transition-colors hover:bg-indigo-700"
                >
                  Message on WhatsApp
                </WhatsAppLink>
              ) : null}
            </div>
          </div>
        </section>
      )

    case 'inquiryForm':
      return (
        <section className={section}>
          {block.heading ? <h2 className={h2}>{block.heading}</h2> : null}
          {block.intro ? <p className="max-w-2xl text-ink-muted">{block.intro}</p> : null}
          <div className="max-w-3xl">
            <InquiryForm />
          </div>
        </section>
      )

    default:
      return null
  }
}
