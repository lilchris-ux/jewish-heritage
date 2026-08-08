import type { GlobalConfig } from 'payload'
import { isAdminOrClientAdmin, isSuperAdmin } from '../access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: { group: 'Configuration' },
  access: { read: () => true, update: isAdminOrClientAdmin },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Company',
          fields: [
            {
              name: 'companyName',
              type: 'text',
              defaultValue: '[PLACEHOLDER — company name]',
            },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            { name: 'tagline', type: 'text', localized: true },
            { name: 'address', type: 'textarea', localized: true },
          ],
        },
        {
          label: 'Contact',
          fields: [
            { name: 'email', type: 'email' },
            { name: 'phone', type: 'text' },
            {
              name: 'whatsappNumber',
              type: 'text',
              admin: {
                description:
                  'International format, digits only, no + or spaces. Example: 212600000000. Changing it here updates every WhatsApp button on the site — no redeploy needed.',
              },
            },
            {
              name: 'whatsappMessage',
              type: 'text',
              localized: true,
              defaultValue: 'Hello, I would like to know more about your Jewish heritage tours.',
              admin: {
                description:
                  'Pre-filled text. On a tour page the tour name is appended automatically.',
              },
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              fields: [
                { name: 'platform', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'SEO defaults',
          fields: [
            { name: 'defaultMetaTitle', type: 'text', localized: true },
            { name: 'defaultMetaDescription', type: 'textarea', localized: true },
            { name: 'defaultOgImage', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Analytics',
          // Restricted to super admins: this is the boundary between the CMS
          // and marketing infrastructure the client shouldn't be editing.
          admin: {
            description:
              "Supplied by the marketing agency. The agency owns its own container and data.",
          },
          fields: [
            {
              name: 'gtmContainerId',
              type: 'text',
              access: { update: ({ req: { user } }) => user?.role === 'super-admin' },
              admin: { description: 'Google Tag Manager container ID, e.g. GTM-XXXXXXX.' },
            },
          ],
        },
      ],
    },
  ],
}

export const siteSettingsAccessNote = isSuperAdmin
