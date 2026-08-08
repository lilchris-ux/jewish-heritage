import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Tours } from './collections/Tours'

const dirname = path.dirname(fileURLToPath(import.meta.url))

// Storage is only wired up when R2 credentials exist, so a developer can run
// the project locally with no cloud account and uploads land on disk instead.
const hasObjectStorage = Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID)

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: ' · Jewish Heritage Morocco',
    },
  },

  collections: [Users, Media, Tours],

  editor: lexicalEditor(),

  // Localization is defined now rather than later: it is a schema-level
  // decision, and retrofitting it would mean migrating every content record.
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'fr', label: 'Français' },
      { code: 'he', label: 'עברית', rtl: true },
    ],
    defaultLocale: 'en',
    fallback: true,
  },

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI ?? '' },
    // Production schema changes go through committed migrations only.
    push: process.env.NODE_ENV !== 'production',
  }),

  plugins: hasObjectStorage
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.S3_BUCKET as string,
          // Uploads go straight from the browser to R2 via a presigned URL.
          // Without this, Netlify's ~4.5MB function body limit would reject
          // ordinary photography.
          clientUploads: true,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION ?? 'auto',
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
            },
          },
        }),
      ]
    : [],

  secret: process.env.PAYLOAD_SECRET ?? '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp: undefined,
})
