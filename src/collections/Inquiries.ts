import type { CollectionConfig } from 'payload'
import { isAdminOrClientAdmin, isSuperAdmin } from '../access/roles'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Inquiry', plural: 'Inquiries' },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'country', 'tourInterest', 'status', 'createdAt'],
    group: 'Sales',
  },
  access: {
    // Inquiries are never publicly readable, and the public form cannot write
    // through the API: submissions go through a validated Server Action which
    // uses the Local API. That keeps the REST endpoint closed to spam bots.
    read: isAdminOrClientAdmin,
    create: () => false,
    update: isAdminOrClientAdmin,
    delete: isSuperAdmin,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'new',
          options: [
            { label: 'New', value: 'new' },
            { label: 'Contacted', value: 'contacted' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'Quoted', value: 'quoted' },
            { label: 'Booked', value: 'booked' },
            { label: 'Lost', value: 'lost' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'assignedTo',
          type: 'relationship',
          relationTo: 'users',
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Traveller',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'fullName', type: 'text', required: true, admin: { width: '50%' } },
            { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'country', type: 'text', admin: { width: '50%' } },
            { name: 'phone', type: 'text', label: 'WhatsApp / phone', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'preferredDates', type: 'text', admin: { width: '50%' } },
            { name: 'travellers', type: 'number', admin: { width: '25%' } },
            { name: 'tripDuration', type: 'text', admin: { width: '25%' } },
          ],
        },
        { name: 'tourInterest', type: 'relationship', relationTo: 'tours' },
        {
          name: 'tripStyle',
          type: 'select',
          options: [
            { label: 'Private', value: 'private' },
            { label: 'Small group', value: 'group' },
            { label: 'Either', value: 'either' },
          ],
        },
        {
          name: 'interests',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Synagogues', value: 'synagogues' },
            { label: 'Jewish cemeteries', value: 'cemeteries' },
            { label: 'Rabbinical tombs', value: 'rabbinical-tombs' },
            { label: 'Mellahs and Jewish quarters', value: 'mellahs' },
            { label: 'Family or ancestral roots', value: 'family-roots' },
            { label: 'Food and culture', value: 'culture' },
            { label: 'General Morocco travel', value: 'general' },
          ],
        },
        { name: 'message', type: 'textarea' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Attribution',
      admin: {
        description:
          'Captured automatically. Lets a marketing agency trace a booking back to a campaign without code changes.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'sourcePage', type: 'text', admin: { width: '50%', readOnly: true } },
            { name: 'referrer', type: 'text', admin: { width: '50%', readOnly: true } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'utmSource', type: 'text', admin: { width: '33%', readOnly: true } },
            { name: 'utmMedium', type: 'text', admin: { width: '33%', readOnly: true } },
            { name: 'utmCampaign', type: 'text', admin: { width: '34%', readOnly: true } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'utmTerm', type: 'text', admin: { width: '50%', readOnly: true } },
            { name: 'utmContent', type: 'text', admin: { width: '50%', readOnly: true } },
          ],
        },
      ],
    },
    {
      name: 'internalNotes',
      type: 'array',
      labels: { singular: 'Note', plural: 'Notes' },
      fields: [
        { name: 'note', type: 'textarea', required: true },
        { name: 'author', type: 'relationship', relationTo: 'users' },
        { name: 'createdAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
      ],
    },
  ],
}
