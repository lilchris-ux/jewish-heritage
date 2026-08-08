import type { GlobalConfig } from 'payload'
import { isAdminOrClientAdmin } from '../access/roles'

const linkFields = [
  { name: 'label', type: 'text' as const, required: true, localized: true },
  {
    name: 'href',
    type: 'text' as const,
    required: true,
    admin: { description: 'A path such as /tours, or a full URL.' },
  },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: { group: 'Configuration' },
  access: { read: () => true, update: isAdminOrClientAdmin },
  fields: [
    {
      name: 'header',
      type: 'array',
      labels: { singular: 'Header link', plural: 'Header links' },
      fields: linkFields,
    },
    {
      name: 'footer',
      type: 'array',
      labels: { singular: 'Footer group', plural: 'Footer groups' },
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'links', type: 'array', fields: linkFields },
      ],
    },
  ],
}
