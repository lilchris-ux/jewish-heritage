'use client'

import { track } from '../lib/tracking'

type Props = {
  href: string
  children: React.ReactNode
  className?: string
  placement: string
  context?: string
}

export function WhatsAppLink({ href, children, className, placement, context }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => track('whatsapp_click', { placement, context })}
    >
      {children}
    </a>
  )
}
