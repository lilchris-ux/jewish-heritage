import type { CollectionConfig } from 'payload'
import { isAdminUser, isAdminOrClientAdmin, publishedOrSignedIn } from '../access/roles'
import { slugFromField } from '../lib/slug'
import { seoFields } from '../lib/seo'
import { publishGuard } from '../hooks/publishGuard'
import { revalidateCollection } from '../hooks/revalidate'

const { afterChange, afterDelete } = revalidateCollection(
  (doc) => (doc.slug ? `/jewish-heritage-sites/${doc.slug}` : null),
  ['/jewish-heritage-sites'],
)

export const HeritageSites: CollectionConfig = {
  slug: 'heritage-sites',
  labels: { singular: 'Heritage Site', plural: 'Heritage Sites' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'siteType', 'city', '_status', 'updatedAt'],
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
          label: 'Site',
          fields: [
            { name: 'name', type: 'text', required: true, localized: true },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              hooks: { beforeValidate: [slugFromField('name')] },
              admin: { position: 'sidebar', description: 'Leave blank to generate from the name.' },
            },
            {
              name: 'siteType',
              type: 'select',
              required: true,
              options: [
                { label: 'Synagogue', value: 'synagogue' },
                { label: 'Jewish cemetery', value: 'cemetery' },
                { label: 'Rabbinical tomb', value: 'rabbinical-tomb' },
                { label: 'Mellah', value: 'mellah' },
                { label: 'Historic Jewish quarter', value: 'jewish-quarter' },
                { label: 'Museum', value: 'museum' },
                { label: 'Heritage landmark', value: 'landmark' },
                { label: 'Other', value: 'other' },
              ],
            },
            { name: 'destination', type: 'relationship', relationTo: 'destinations' },
            {
              type: 'row',
              fields: [
                { name: 'city', type: 'text', localized: true, admin: { width: '50%' } },
                { name: 'region', type: 'text', localized: true, admin: { width: '50%' } },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              localized: true,
              maxLength: 200,
            },
            { name: 'description', type: 'richText', localized: true },
            { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
          ],
        },
        {
          label: 'History',
          fields: [
            {
              name: 'historicalInfo',
              type: 'richText',
              localized: true,
              admin: {
                description:
                  'Historical background. Record only what can be supported — cite your sources below.',
              },
            },
            {
              name: 'historicalSources',
              type: 'array',
              labels: { singular: 'Source', plural: 'Sources' },
              admin: {
                description:
                  'Where the history above comes from. Keeping sources here is how the site stays factual.',
              },
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'url', type: 'text' },
              ],
            },
            {
              name: 'visitingInfo',
              type: 'richText',
              localized: true,
              admin: { description: 'Access, opening times, dress code, photography rules.' },
            },
          ],
        },
        {
          label: 'Connections',
          fields: [
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
