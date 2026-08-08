import type { CollectionConfig } from 'payload'
import { isAdminUser, isAdminOrClientAdmin, publishedOrSignedIn } from '../access/roles'
import { slugFromField } from '../lib/slug'
import { seoFields } from '../lib/seo'
import { publishGuard } from '../hooks/publishGuard'
import { revalidateCollection } from '../hooks/revalidate'
import { layoutBlocks } from '../blocks'

const { afterChange, afterDelete } = revalidateCollection((doc) =>
  doc.slug === 'home' ? '/' : doc.slug ? `/${doc.slug}` : null,
)

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    group: 'Content',
    description:
      'Built from blocks. Marketing landing pages are created here — no developer needed.',
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
          label: 'Page',
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
                description: 'Use "home" for the homepage. Otherwise this becomes the URL.',
              },
            },
            { name: 'layout', type: 'blocks', blocks: layoutBlocks, localized: false },
          ],
        },
        { label: 'SEO', fields: seoFields },
      ],
    },
  ],
}
