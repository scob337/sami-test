import { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturesSection } from '@/components/home/features-section'
import { AboutSection } from '@/components/home/about-section'

export const metadata: Metadata = {
  title: 'Sami-Test - اكتشف نمط شخصيتك بعمق',
  description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم يعتمد على أحدث المناهج العلمية. احصل على تقرير شامل وتوصيات مخصصة من الخبراء.',
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://Sami-Test.app',
    title: 'Sami-Test - اكتشف نمط شخصيتك بعمق',
    description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم بإشراف الخبراء',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <div className="flex-1">
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
      </div>
      <Footer />
    </main>
  )
}
