/**
 * Creates the site skeleton: navigation, settings and a homepage built from
 * blocks. Everything the client must supply is written as a clearly marked
 * placeholder — no invented tours, history, prices, reviews or statistics.
 *
 * Safe to re-run: it updates the same records rather than duplicating them.
 *
 *   npx tsx scripts/seed.mts
 */
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const PLACEHOLDER = '[PLACEHOLDER — client to supply]'

const payload = await getPayload({ config })

const upsertPage = async (slug: string, data: Record<string, unknown>) => {
  const { docs } = await payload.find({ collection: 'pages', where: { slug: { equals: slug } }, limit: 1 })
  if (docs[0]) {
    await payload.update({ collection: 'pages', id: docs[0].id, data: data as never })
    return `updated page /${slug}`
  }
  await payload.create({ collection: 'pages', data: { slug, ...data } as never })
  return `created page /${slug}`
}

console.log(
  await upsertPage('home', {
    title: 'Home',
    _status: 'published',
    layout: [
      {
        blockType: 'hero',
        eyebrow: 'Heritage travel in Morocco',
        heading: "Journeys through Morocco's Jewish heritage",
        subheading: PLACEHOLDER,
        ctaLabel: 'Explore tours',
        ctaHref: '/tours',
      },
      {
        blockType: 'richText',
        heading: 'Why travel with us',
        content: null,
      },
      { blockType: 'tourGrid', heading: 'Featured journeys', limit: 3 },
      { blockType: 'heritageGrid', heading: 'Heritage sites', limit: 6 },
      { blockType: 'destinationGrid', heading: 'Where we travel', limit: 6 },
      { blockType: 'faqAccordion', heading: 'Common questions', scope: 'general' },
      {
        blockType: 'ctaBanner',
        heading: 'Plan a journey around what matters to you',
        body: 'Tell us what you would like to see and we will build an itinerary around it.',
        showInquiryButton: true,
        showWhatsAppButton: true,
      },
    ],
  }),
)

for (const [slug, title] of [
  ['about', 'About Us'],
  ['why-travel-with-us', 'Why Travel With Us'],
  ['private-jewish-tours-morocco', 'Private Jewish Tours in Morocco'],
  ['jewish-heritage-morocco', 'Jewish Heritage in Morocco'],
  ['custom-tours', 'Custom Tours'],
  ['privacy-policy', 'Privacy Policy'],
  ['terms', 'Terms and Conditions'],
] as const) {
  console.log(
    await upsertPage(slug, {
      title,
      _status: 'draft',
      layout: [
        { blockType: 'hero', heading: title, subheading: PLACEHOLDER },
        { blockType: 'richText', content: null },
        { blockType: 'ctaBanner', heading: 'Talk to us about your trip' },
      ],
    }),
  )
}

await payload.updateGlobal({
  slug: 'navigation',
  data: {
    header: [
      { label: 'Tours', href: '/tours' },
      { label: 'Heritage Sites', href: '/jewish-heritage-sites' },
      { label: 'Destinations', href: '/destinations' },
      { label: 'Travel Guide', href: '/travel-guide' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    footer: [
      {
        title: 'Explore',
        links: [
          { label: 'Jewish Heritage Tours', href: '/tours' },
          { label: 'Private Jewish Tours', href: '/private-jewish-tours-morocco' },
          { label: 'Custom Tours', href: '/custom-tours' },
          { label: 'Heritage Sites', href: '/jewish-heritage-sites' },
        ],
      },
      {
        title: 'Company',
        links: [
          { label: 'About Us', href: '/about' },
          { label: 'Why Travel With Us', href: '/why-travel-with-us' },
          { label: 'FAQ', href: '/faq' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      {
        title: 'Legal',
        links: [
          { label: 'Privacy Policy', href: '/privacy-policy' },
          { label: 'Terms and Conditions', href: '/terms' },
        ],
      },
    ],
  } as never,
})
console.log('updated navigation')

const settings = await payload.findGlobal({ slug: 'site-settings' })
if (!settings?.companyName || settings.companyName.startsWith('[PLACEHOLDER')) {
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      companyName: PLACEHOLDER,
      whatsappMessage: 'Hello, I would like to know more about your Jewish heritage tours.',
    } as never,
  })
  console.log('initialised site settings')
}

console.log('\nSeed complete. Nothing was invented — every content field is a placeholder.')
process.exit(0)
