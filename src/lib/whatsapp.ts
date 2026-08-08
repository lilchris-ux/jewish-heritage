/**
 * Builds a wa.me deep link with the message pre-filled, so a traveller
 * messaging from a tour page arrives with the tour already named.
 */
export const whatsappHref = (
  number: string | null | undefined,
  message: string | null | undefined,
  context?: string | null,
): string | null => {
  if (!number) return null
  const digits = number.replace(/[^0-9]/g, '')
  if (!digits) return null

  const base = message ?? 'Hello, I would like to know more about your Jewish heritage tours.'
  const text = context ? `${base} (${context})` : base
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
}
