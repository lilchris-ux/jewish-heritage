import type { CollectionConfig } from 'payload'
import {
  isAdminUser,
  isAdminOrClientAdmin,
  publishedOrSignedIn,
  userCanPublish,
} from '../access/roles'
import { slugFromField } from '../lib/slug'
import { seoFields } from '../lib/seo'

export const Tours: CollectionConfig = {
  slug: 'tours',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'tourType', 'availabilityStatus', '_status', 'updatedAt'],
    group: 'Content',
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SERVER_URL ?? ''}/tours/${data?.slug ?? ''}`,
    },
  },
  versions: { drafts: true },
  hooks: {
    beforeChange: [
      ({ data, req, originalDoc }) => {
        // Payload owns `_status`; editors may write content but not publish it.
        if (req.user && !userCanPublish(req.user) && data?._status === 'published') {
          return { ...data, _status: originalDoc?._status ?? 'draft' }
        }
        return data
      },
    ],
  },
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
          label: 'Overview',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              index: true,
              hooks: { beforeValidate: [slugFromField('title')] },
              admin: {
                position: 'sidebar',
                description: 'The URL. Leave blank to generate it from the title.',
              },
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              localized: true,
              maxLength: 200,
              admin: { description: 'One or two sentences, used on cards and in search results.' },
            },
            {
              name: 'description',
              type: 'richText',
              localized: true,
            },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
            {
              name: 'gallery',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
            },
            {
              name: 'tourType',
              type: 'select',
              defaultValue: 'private',
              options: [
                { label: 'Private', value: 'private' },
                { label: 'Small group', value: 'small-group' },
                { label: 'Custom', value: 'custom' },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'durationDays', type: 'number', min: 1, admin: { width: '50%' } },
                { name: 'durationNights', type: 'number', min: 0, admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'startLocation', type: 'text', localized: true, admin: { width: '50%' } },
                { name: 'endLocation', type: 'text', localized: true, admin: { width: '50%' } },
              ],
            },
            {
              name: 'highlights',
              type: 'array',
              localized: true,
              labels: { singular: 'Highlight', plural: 'Highlights' },
              fields: [{ name: 'text', type: 'text', required: true }],
            },
          ],
        },
        {
          label: 'Itinerary',
          fields: [
            {
              name: 'itinerary',
              type: 'array',
              localized: true,
              labels: { singular: 'Day', plural: 'Days' },
              admin: { initCollapsed: true },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'dayNumber', type: 'number', required: true, admin: { width: '25%' } },
                    { name: 'title', type: 'text', required: true, admin: { width: '75%' } },
                  ],
                },
                { name: 'description', type: 'richText' },
                { name: 'overnightIn', type: 'text' },
                {
                  name: 'meals',
                  type: 'select',
                  hasMany: true,
                  options: [
                    { label: 'Breakfast', value: 'breakfast' },
                    { label: 'Lunch', value: 'lunch' },
                    { label: 'Dinner', value: 'dinner' },
                  ],
                },
                { name: 'image', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: 'Practicalities',
          fields: [
            {
              name: 'included',
              type: 'array',
              localized: true,
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            {
              name: 'excluded',
              type: 'array',
              localized: true,
              fields: [{ name: 'text', type: 'text', required: true }],
            },
            { name: 'accommodationInfo', type: 'richText', localized: true },
            { name: 'transportationInfo', type: 'richText', localized: true },
          ],
        },
        {
          label: 'Pricing & availability',
          fields: [
            {
              name: 'showPrice',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Off by default. While off, the page shows a "Request a quote" call to action instead of a price — so an unpriced tour never renders an empty or invented figure.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'priceFrom',
                  type: 'number',
                  min: 0,
                  admin: { width: '50%', condition: (data) => Boolean(data?.showPrice) },
                },
                {
                  name: 'currency',
                  type: 'select',
                  defaultValue: 'USD',
                  options: ['USD', 'EUR', 'GBP', 'MAD'],
                  admin: { width: '50%', condition: (data) => Boolean(data?.showPrice) },
                },
              ],
            },
            {
              name: 'priceNote',
              type: 'text',
              localized: true,
              admin: { condition: (data) => Boolean(data?.showPrice) },
            },
            {
              name: 'availabilityStatus',
              type: 'select',
              defaultValue: 'on-request',
              options: [
                { label: 'Available', value: 'available' },
                { label: 'Limited', value: 'limited' },
                { label: 'Seasonal', value: 'seasonal' },
                { label: 'On request', value: 'on-request' },
                { label: 'Sold out', value: 'sold-out' },
              ],
            },
            {
              name: 'seasonalNote',
              type: 'text',
              localized: true,
              admin: {
                description:
                  'Shown when the tour only runs at certain times of year, so the site never implies year-round availability.',
              },
            },
          ],
        },
        { label: 'SEO', fields: seoFields },
      ],
    },
  ],
}
