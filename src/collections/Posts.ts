import type { CollectionConfig } from 'payload'
import { isAdminUser, isAdminOrClientAdmin, publishedOrSignedIn } from '../access/roles'
import { slugFromField } from '../lib/slug'
import { seoFields } from '../lib/seo'
import { publishGuard } from '../hooks/publishGuard'
import { revalidateCollection } from '../hooks/revalidate'

const { afterChange, afterDelete } = revalidateCollection(
  (doc) => (doc.slug ? `/travel-guide/${doc.slug}` : null),
  ['/travel-guide'],
)

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: { singular: 'Article', plural: 'Articles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
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
          label: 'Article',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              hooks: { beforeValidate: [slugFromField('title')] },
              admin: { position: 'sidebar' },
            },
            { name: 'featuredImage', type: 'upload', relationTo: 'media' },
            { name: 'excerpt', type: 'textarea', localized: true, maxLength: 250 },
            { name: 'content', type: 'richText', localized: true },
            { name: 'category', type: 'relationship', relationTo: 'categories' },
            { name: 'author', type: 'relationship', relationTo: 'users' },
            {
              name: 'publishedAt',
              type: 'date',
              admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
            },
            { name: 'relatedTours', type: 'relationship', relationTo: 'tours', hasMany: true },
            {
              name: 'relatedSites',
              type: 'relationship',
              relationTo: 'heritage-sites',
              hasMany: true,
            },
          ],
        },
        { label: 'SEO', fields: seoFields },
      ],
    },
  ],
}
