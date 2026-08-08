import { NextResponse, type NextRequest } from 'next/server'
import { DEFAULT_LOCALE, LOCALES } from './lib/i18n'

const PREFIXED = LOCALES.filter((l) => l !== DEFAULT_LOCALE)

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Already carries a locale prefix — nothing to do.
  if (PREFIXED.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) {
    return NextResponse.next()
  }

  // Default locale is served from the root, so rewrite it onto the [locale]
  // segment internally without changing the URL the visitor sees.
  const url = request.nextUrl.clone()
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // The CMS, the content API and static assets must never be rewritten.
  matcher: ['/((?!admin|api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)'],
}
