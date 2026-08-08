import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...(process.env.NEXT_PUBLIC_S3_PUBLIC_URL
        ? [
            {
              protocol: new URL(process.env.NEXT_PUBLIC_S3_PUBLIC_URL).protocol.replace(':', ''),
              hostname: new URL(process.env.NEXT_PUBLIC_S3_PUBLIC_URL).hostname,
            },
          ]
        : []),
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
