import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
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
  title: 'MindMatch - اختبر شخصيتك الآن',
  description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم يعتمد على الذكاء الاصطناعي. احصل على تقرير شامل وتوصيات مخصصة.',
  generator: 'Next.js 16',
  keywords: ['اختبار الشخصية', 'تحليل الشخصية', 'AI', 'الذكاء الاصطناعي', 'personality test'],
  authors: [{ name: 'MindMatch Team' }],
  creator: 'MindMatch',
  publisher: 'MindMatch',
  robots: 'index, follow',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://mindmatch.app',
    siteName: 'MindMatch',
    title: 'MindMatch - اختبر شخصيتك الآن',
    description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم يعتمد على الذكاء الاصطناعي',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindMatch - اختبر شخصيتك الآن',
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
      className={`${geist.variable} ${geistMono.variable} dark`}
      dir="rtl"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#5B3BA0" />
      </head>
      <body 
        className="font-sans antialiased bg-background text-foreground min-h-screen relative overflow-x-hidden"
        suppressHydrationWarning
      >
        {/* Ambient Aurora Background */}
        <div className="aurora-bg">
          <div className="aurora-dot w-[500px] h-[500px] bg-primary/20 -top-48 -left-48" />
          <div className="aurora-dot w-[400px] h-[400px] bg-secondary/15 top-1/2 -right-24" />
          <div className="aurora-dot w-[600px] h-[600px] bg-accent/10 -bottom-48 left-1/2 -translate-x-1/2" />
        </div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          {children}
        </div>
        
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  )
}
