import type { CollectionConfig } from 'payload'
import { isAdminUser, isAdminOrClientAdmin } from '../access/roles'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  admin: { useAsTitle: 'question', defaultColumns: ['question', 'scope', 'order'], group: 'Content' },
  defaultSort: 'order',
  access: {
    read: () => true,
    create: isAdminUser,
    update: isAdminUser,
    delete: isAdminOrClientAdmin,
  },
  fields: [
    { name: 'question', type: 'text', required: true, localized: true },
    { name: 'answer', type: 'richText', required: true, localized: true },
    {
      name: 'scope',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Booking', value: 'booking' },
        { label: 'Specific tour', value: 'tour' },
        { label: 'Specific destination', value: 'destination' },
      ],
    },
    {
      name: 'tour',
      type: 'relationship',
      relationTo: 'tours',
      admin: { condition: (data) => data?.scope === 'tour' },
    },
    {
      name: 'destination',
      type: 'relationship',
      relationTo: 'destinations',
      admin: { condition: (data) => data?.scope === 'destination' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
  ],
}
