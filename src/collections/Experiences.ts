import type { CollectionConfig } from 'payload'
import { isAdminUser, isAdminOrClientAdmin, publishedOrSignedIn } from '../access/roles'
import { slugFromField } from '../lib/slug'
import { seoFields } from '../lib/seo'
import { publishGuard } from '../hooks/publishGuard'
import { revalidateCollection } from '../hooks/revalidate'

const { afterChange, afterDelete } = revalidateCollection(
  (doc) => (doc.slug ? `/experiences/${doc.slug}` : null),
  ['/experiences'],
)

export const Experiences: CollectionConfig = {
  slug: 'experiences',
  admin: { useAsTitle: 'title', defaultColumns: ['title', '_status', 'updatedAt'], group: 'Content' },
  versions: { drafts: true },
  hooks: { beforeChange: [publishGuard], afterChange, afterDelete },
  access: {
    read: publishedOrSignedIn,
    create: isAdminUser,
    update: isAdminUser,
    delete: isAdminOrClientAdmin,
  },
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
    { name: 'summary', type: 'textarea', localized: true, maxLength: 200 },
    { name: 'description', type: 'richText', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'destinations', type: 'relationship', relationTo: 'destinations', hasMany: true },
    { name: 'relatedTours', type: 'relationship', relationTo: 'tours', hasMany: true },
    { name: 'seo', type: 'group', fields: seoFields },
  ],
}
