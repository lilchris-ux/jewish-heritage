import type { Field } from 'payload'

/**
 * Shared SEO tab. Every field is optional: the page templates fall back to the
 * document's own title and description, so a tour is never published with an
 * empty or duplicated <title>.
 */
export const seoFields: Field[] = [
  {
    name: 'metaTitle',
    type: 'text',
    localized: true,
    admin: { description: 'Around 60 characters. Falls back to the title if left blank.' },
  },
  {
    name: 'metaDescription',
    type: 'textarea',
    localized: true,
    maxLength: 200,
    admin: {
      description: 'Around 155 characters. Falls back to the short description if left blank.',
    },
  },
  {
    name: 'ogImage',
    type: 'upload',
    relationTo: 'media',
    admin: { description: 'Image shown when the page is shared. Falls back to the hero image.' },
  },
  {
    name: 'noindex',
    type: 'checkbox',
    defaultValue: false,
    admin: { description: 'Hide this page from search engines.' },
  },
]
