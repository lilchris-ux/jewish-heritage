import type { CollectionConfig } from 'payload'
import { isAdminUser, isAdminOrClientAdmin, publishedOrSignedIn } from '../access/roles'
import { slugFromField } from '../lib/slug'
import { seoFields } from '../lib/seo'
import { publishGuard } from '../hooks/publishGuard'
import { revalidateCollection } from '../hooks/revalidate'

const { afterChange, afterDelete } = revalidateCollection(
  (doc) => (doc.slug ? `/destinations/${doc.slug}` : null),
  ['/destinations'],
)

export const Destinations: CollectionConfig = {
  slug: 'destinations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', '_status', 'updatedAt'],
    group: 'Content',
  },
  versions: { drafts: true },
  hooks: { beforeChange: [publishGuard], afterChange, afterDelete },
  access: {
    read: publishedOrSignedIn,
    create: isAdminUser,
    update: isAdminUser,
    delete: isAdminOrClientAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Destination',
          fields: [
            { name: 'name', type: 'text', required: true, localized: true },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              hooks: { beforeValidate: [slugFromField('name')] },
              admin: { position: 'sidebar' },
            },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            { name: 'shortDescription', type: 'textarea', localized: true, maxLength: 200 },
            { name: 'overview', type: 'richText', localized: true },
            {
              name: 'jewishHeritage',
              type: 'richText',
              localized: true,
              admin: { description: "This destination's Jewish heritage and community history." },
            },
            { name: 'historicalSignificance', type: 'richText', localized: true },
            { name: 'gallery', type: 'upload', relationTo: 'media', hasMany: true },
          ],
        },
        { label: 'SEO', fields: seoFields },
      ],
    },
  ],
}
