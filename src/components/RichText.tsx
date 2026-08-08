import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

export function RichText({
  data,
  className,
}: {
  data?: SerializedEditorState | null
  className?: string
}) {
  if (!data) return null
  return (
    <div
      className={
        className ??
        'flex flex-col gap-4 leading-relaxed text-ink-muted [&_a]:text-indigo-700 [&_a]:underline [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-indigo-900 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-ink [&_ol]:list-decimal [&_ol]:ps-5 [&_strong]:text-ink [&_ul]:list-disc [&_ul]:ps-5'
      }
    >
      <LexicalRichText data={data} />
    </div>
  )
}
