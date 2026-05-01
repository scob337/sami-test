import type { Metadata, Viewport } from 'next'
import { SupportButton } from '@/components/chat/SupportButton'
import { NotificationToast } from '@/components/notifications/NotificationToast'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthInitializer } from '@/components/providers/auth-initializer'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://7types.online'),
  title: {
    default: '7Types - اختبر شخصيتك الآن',
    template: '%s | 7Types'
  },
  description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم يعتمد على الذكاء الاصطناعي. احصل على تقرير شامل وتوصيات مخصصة.',
  generator: 'Next.js',
  applicationName: '7Types',
  referrer: 'origin-when-cross-origin',
  keywords: ['اختبار الشخصية', 'تحليل الشخصية', '7Types', 'الذكاء الاصطناعي', 'personality test', 'نمط الشخصية', 'اكتشف نفسك'],
  authors: [{ name: '7Types Team', url: 'https://7types.online' }],
  creator: '7Types',
  publisher: '7Types',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://7types.online',
    siteName: '7Types',
    title: '7Types - اختبر شخصيتك الآن',
    description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم يعتمد على الذكاء الاصطناعي',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '7Types - ابدأ رحلة اكتشاف ذاتك',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '7Types - اختبر شخصيتك الآن',
    description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم يعتمد على الذكاء الاصطناعي',
    creator: '@7types_app',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      suppressHydrationWarning
      className="antialiased"
      dir="rtl"
    >
      <head>
        <meta name="google-site-verification" content="gDWBh4IxFs8bIqbDHDvMHqrBAb0zLFju5kHupaiQ-_U" />
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#3B82F6" />
      </head>
      <body
        className="font-cairo antialiased bg-background text-foreground min-h-screen relative overflow-x-hidden selection:bg-primary/30 selection:text-primary-foreground"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* SEO Structured Data */}
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "7Types",
              "url": "https://7types.online",
              "logo": "https://7types.online/icon.png",
              "sameAs": [
                "https://twitter.com/7types_app",
                "https://www.facebook.com/7types.app"
              ]
            }}
          />
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "7Types",
              "url": "https://7types.online",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://7types.online/courses?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            }}
          />

          {/* Ambient Aurora Background */}
          <div className="aurora-bg">
            <div className="aurora-dot w-[500px] h-[500px] bg-primary/20 -top-48 -left-48" />
            <div className="aurora-dot w-[400px] h-[400px] bg-secondary/15 top-1/2 -right-24" />
            <div className="aurora-dot w-[600px] h-[600px] bg-accent/10 -bottom-48 left-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            <AuthInitializer>
              <NavbarWrapper />
              {children}
              <SupportButton />
              <NotificationToast />
            </AuthInitializer>
          </div>

          <Toaster position="bottom-left" dir="rtl" richColors duration={5000} />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}

import { NavbarWrapper } from '@/components/layout/navbar-wrapper'
import { Footer } from '@/components/layout/footer'
import { JsonLd } from '@/components/seo/JsonLd'
