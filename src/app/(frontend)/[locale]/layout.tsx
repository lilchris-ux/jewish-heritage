import { notFound } from 'next/navigation'
import { Fraunces, Inter, Frank_Ruhl_Libre, Heebo } from 'next/font/google'
import { Header } from '../../../components/Header'
import { Footer } from '../../../components/Footer'
import { Analytics } from '../../../components/Analytics'
import { JsonLd } from '../../../components/JsonLd'
import { getSiteSettings, getNavigation, baseUrl } from '../../../lib/site'
import { dirFor, isLocale, type Locale } from '../../../lib/i18n'
import { whatsappHref } from '../../../lib/whatsapp'
import '../styles.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' })
const frankRuhl = Frank_Ruhl_Libre({
  subsets: ['hebrew'],
  variable: '--font-display-he',
  display: 'swap',
})
const heebo = Heebo({ subsets: ['hebrew'], variable: '--font-body-he', display: 'swap' })

export const revalidate = 3600

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }, { locale: 'he' }]
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  if (!isLocale(raw)) notFound()
  const locale = raw as Locale

  const [settings, nav] = await Promise.all([getSiteSettings(locale), getNavigation(locale)])
  const companyName = settings?.companyName || 'Jewish Heritage Morocco'
  const whatsapp = whatsappHref(settings?.whatsappNumber, settings?.whatsappMessage)

  // Hebrew visitors get Hebrew faces; everyone else never downloads them.
  const fontVars =
    locale === 'he'
      ? `${frankRuhl.variable} ${heebo.variable}`
      : `${fraunces.variable} ${inter.variable}`

  return (
    <html lang={locale} dir={dirFor(locale)} className={fontVars}>
      <body className="flex min-h-screen flex-col bg-sand-50 text-ink antialiased">
        <Analytics containerId={settings?.gtmContainerId ?? process.env.NEXT_PUBLIC_GTM_ID} />
        <Header
          locale={locale}
          companyName={companyName}
          links={nav?.header ?? []}
          whatsapp={whatsapp}
        />
        <div className="flex-1">{children}</div>
        <Footer
          locale={locale}
          companyName={companyName}
          groups={nav?.footer ?? []}
          email={settings?.email}
          phone={settings?.phone}
          address={settings?.address}
        />
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'TravelAgency',
            name: companyName,
            url: baseUrl(),
            ...(settings?.email ? { email: settings.email } : {}),
            ...(settings?.phone ? { telephone: settings.phone } : {}),
          }}
        />
      </body>
    </html>
  )
}
