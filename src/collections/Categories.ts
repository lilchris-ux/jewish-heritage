import type { CollectionConfig } from 'payload'
import { isAdminUser, isAdminOrClientAdmin } from '../access/roles'
import { slugFromField } from '../lib/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'title', group: 'Content' },
  access: {
    read: () => true,
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
    { name: 'description', type: 'textarea', localized: true },
  ],
}
