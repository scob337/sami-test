import { Metadata } from 'next'
import { HeroSection } from '@/components/home/hero-section'

export const metadata: Metadata = {
  title: '7Types - اكتشف نمط شخصيتك بعمق',
  description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم يعتمد على أحدث المناهج العلمية. احصل على تقرير شامل وتوصيات مخصصة من الخبراء.',
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://7types.online',
    title: '7Types - اكتشف نمط شخصيتك بعمق',
    description: 'اكتشف شخصيتك الحقيقية من خلال اختبار متقدم بإشراف الخبراء',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#0A1A3B] text-white font-sans overflow-hidden">
      <HeroSection />
    </main>
  )
}
