import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Cairo } from 'next/font/google'
import { SupportButton } from '@/components/chat/SupportButton'
import { NotificationToast } from '@/components/notifications/NotificationToast'

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthInitializer } from '@/components/providers/auth-initializer'
import './globals.css'

const geist = Geist({
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sami-Test - اختبر شخصيتك الآن',
  description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم يعتمد على الذكاء الاصطناعي. احصل على تقرير شامل وتوصيات مخصصة.',
  generator: 'Next.js 16',
  keywords: ['اختبار الشخصية', 'تحليل الشخصية', 'AI', 'الذكاء الاصطناعي', 'personality test'],
  authors: [{ name: 'Sami-Test Team' }],
  creator: 'Sami-Test',
  publisher: 'Sami-Test',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://Sami-Test.app',
    siteName: 'Sami-Test',
    title: 'Sami-Test - اختبر شخصيتك الآن',
    description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم يعتمد على الذكاء الاصطناعي',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sami-Test - اختبر شخصيتك الآن',
    description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم يعتمد على الذكاء الاصطناعي',
  },
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
      className={`${geist.variable} ${geistMono.variable} ${cairo.variable}`}
      dir="rtl"
    >
      <head>
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

          <Toaster position="bottom-right" richColors />
          <Footer/>
        </ThemeProvider>
      </body>
    </html>
  )
}

import { NavbarWrapper } from '@/components/layout/navbar-wrapper'
import { Footer } from '@/components/layout/footer'

