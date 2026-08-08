import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getPayloadClient } from '../../../../../lib/payload'
import { buildMetadata } from '../../../../../lib/metadata'
import { RichText } from '../../../../../components/RichText'
import { Breadcrumbs } from '../../../../../components/Breadcrumbs'
import { JsonLd } from '../../../../../components/JsonLd'
import { baseUrl } from '../../../../../lib/site'
import { localePath, type Locale } from '../../../../../lib/i18n'

export const revalidate = 3600

type Args = { params: Promise<{ locale: Locale; slug: string }> }

const findPost = async (slug: string, locale: Locale) => {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'posts',
    where: { slug: { equals: slug }, _status: { equals: 'published' } },
    limit: 1,
    locale,
    depth: 2,
  })
  return (docs[0] as any) ?? null
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug, locale } = await params
  const post = await findPost(slug, locale)
  if (!post) return { title: 'Article not found' }
  return buildMetadata({
    seo: post,
    fallbackTitle: post.title,
    fallbackDescription: post.excerpt,
    path: `/travel-guide/${slug}`,
    locale,
  })
}

export default async function PostPage({ params }: Args) {
  const { slug, locale } = await params
  const post = await findPost(slug, locale)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-3xl px-6 py-12">
      <Breadcrumbs
        locale={locale}
        baseUrl={baseUrl()}
        items={[
          { label: 'Home', href: '/' },
          { label: 'Travel guide', href: '/travel-guide' },
          { label: post.title },
        ]}
      />
      <h1 className="font-[family-name:var(--font-display)] text-4xl leading-tight font-semibold text-indigo-900 text-balance">
        {post.title}
      </h1>
      <div className="mt-3 flex flex-wrap gap-3 text-sm text-ink-muted">
        {post.publishedAt ? (
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString(locale, {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        ) : null}
        {post.author && typeof post.author === 'object' ? <span>{post.author.name}</span> : null}
      </div>

      {post.featuredImage?.url ? (
        <div className="relative mt-8 aspect-16/9 overflow-hidden rounded-lg">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt ?? ''}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="mt-8">
        <RichText data={post.content} />
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt ?? undefined,
          datePublished: post.publishedAt ?? undefined,
          url: `${baseUrl()}${localePath(locale, `/travel-guide/${slug}`)}`,
          ...(post.author && typeof post.author === 'object'
            ? { author: { '@type': 'Person', name: post.author.name } }
            : {}),
        }}
      />
    </article>
  )
}
