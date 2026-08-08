import type { CollectionConfig } from 'payload'
import { isAdminUser, isAdminOrClientAdmin } from '../access/roles'

export const Departures: CollectionConfig = {
  slug: 'departures',
  admin: {
    useAsTitle: 'startDate',
    defaultColumns: ['tour', 'startDate', 'endDate', 'status'],
    group: 'Content',
    description:
      'Dated departures. A tour with no departures listed is shown as available on request, never as running year-round.',
  },
  defaultSort: 'startDate',
  access: {
    read: () => true,
    create: isAdminUser,
    update: isAdminUser,
    delete: isAdminOrClientAdmin,
  },
  fields: [
    { name: 'tour', type: 'relationship', relationTo: 'tours', required: true, index: true },
    {
      type: 'row',
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          index: true,
          admin: { width: '50%', date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'endDate',
          type: 'date',
          admin: { width: '50%', date: { pickerAppearance: 'dayOnly' } },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'open',
      options: [
        { label: 'Open', value: 'open' },
        { label: 'Limited places', value: 'limited' },
        { label: 'Closed', value: 'closed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    { name: 'note', type: 'text', localized: true },
  ],
}
