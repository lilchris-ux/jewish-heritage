import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

const LOCALE_PREFIXES = ['', '/fr', '/he']

/**
 * Purges the cached pages a document appears on the moment it is saved, so an
 * editor's change is live within seconds — no rebuild, no redeploy.
 *
 * Wrapped in try/catch because `revalidatePath` is only valid inside a Next.js
 * request; seed scripts and CLI tasks call the same hooks and must not crash.
 */
export const revalidateCollection = (
  pathFor?: (doc: Record<string, unknown>) => string | null,
  indexPaths: string[] = [],
): { afterChange: CollectionAfterChangeHook[]; afterDelete: CollectionAfterDeleteHook[] } => {
  const purge = (doc: Record<string, unknown>) => {
    try {
      const paths = [pathFor?.(doc), ...indexPaths].filter(Boolean) as string[]
      for (const path of paths) {
        for (const prefix of LOCALE_PREFIXES) {
          revalidatePath(`${prefix}${path}` || '/')
        }
      }
    } catch {
      // Outside a Next.js request (seed script, CLI) there is no cache to purge.
    }
  }

  return {
    afterChange: [
      ({ doc, previousDoc }) => {
        purge(doc as Record<string, unknown>)
        // A renamed slug leaves the old URL cached, so purge that one too.
        const before = previousDoc as { slug?: string } | undefined
        if (before && before.slug !== (doc as { slug?: string }).slug) {
          purge(previousDoc as Record<string, unknown>)
        }
        return doc
      },
    ],
    afterDelete: [
      ({ doc }) => {
        purge(doc as Record<string, unknown>)
        return doc
      },
    ],
  }
}
