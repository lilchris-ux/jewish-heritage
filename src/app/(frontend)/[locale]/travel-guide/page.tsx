import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getPayloadClient } from '../../../../lib/payload'
import { buildMetadata } from '../../../../lib/metadata'
import { Breadcrumbs } from '../../../../components/Breadcrumbs'
import { baseUrl } from '../../../../lib/site'
import { localePath, type Locale } from '../../../../lib/i18n'

export const revalidate = 3600

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    fallbackTitle: 'Travel Guide',
    fallbackDescription:
      'Articles on Moroccan Jewish history, heritage sites and practical travel guidance.',
    path: '/travel-guide',
    locale,
  })
}

export default async function BlogIndex({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { _status: { equals: 'published' } },
    sort: '-publishedAt',
    limit: 30,
    locale,
    depth: 1,
  })

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Breadcrumbs
        locale={locale}
        baseUrl={baseUrl()}
        items={[{ label: 'Home', href: '/' }, { label: 'Travel guide' }]}
      />
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-indigo-900 text-balance">
        Travel Guide
      </h1>
      {docs.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-sand-200 bg-sand-100 px-5 py-8 text-ink-muted">
          No published articles yet.
        </p>
      ) : (
        <ul className="mt-10 flex flex-col gap-6">
          {docs.map((post: any) => (
            <li key={post.id}>
              <Link
                href={localePath(locale, `/travel-guide/${post.slug}`)}
                className="flex gap-5 rounded-lg border border-sand-200 bg-white p-5 transition-colors hover:border-brass"
              >
                {post.featuredImage?.url ? (
                  <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden rounded sm:block">
                    <Image
                      src={post.featuredImage.url}
                      alt={post.featuredImage.alt ?? ''}
                      fill
                      sizes="144px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex flex-col gap-1.5">
                  <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-indigo-900">
                    {post.title}
                  </span>
                  {post.excerpt ? (
                    <span className="text-sm text-ink-muted">{post.excerpt}</span>
                  ) : null}
                  {post.publishedAt ? (
                    <time className="text-xs text-brass" dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString(locale, {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </time>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
