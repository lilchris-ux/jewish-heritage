import type { CollectionConfig } from 'payload'
import { isAdminUser, isAdminOrClientAdmin } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: { group: 'Content' },
  access: {
    read: () => true,
    create: isAdminUser,
    update: isAdminUser,
    delete: isAdminOrClientAdmin,
  },
  upload: {
    // No imageSizes: Netlify Image CDN generates responsive derivatives on
    // demand from the original, which keeps the function bundle small.
    mimeTypes: ['image/*'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description:
          'Describe the image for screen readers and search engines. Required — no image ships without it.',
      },
    },
    { name: 'caption', type: 'text', localized: true },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Photographer or source, where attribution is required.' },
    },
  ],
}
