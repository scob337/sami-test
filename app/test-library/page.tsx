import { Metadata } from 'next'
import TestLibraryPageClient from './library-client'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'مكتبة الاختبارات الشخصية | 7Types',
  description: 'استكشف الدليل الشامل لاختبارات تحليل الشخصية. افهم كيف يوجه الأشخاص المختلفون طاقتهم، ويعالجون المعلومات، ويتخصون القرارات.',
  openGraph: {
    title: 'مكتبة الاختبارات الشخصية | 7Types',
    description: 'استكشف الدليل الشامل لاختبارات تحليل الشخصية وافهم نفسك بشكل أفضل.',
    images: ['/og-library.png'],
  },
}

export default function TestLibraryPage() {
  const librarySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "مكتبة الاختبارات الشخصية",
    "description": "دليل شامل لاختبارات تحليل الشخصية والكتب الإرشادية.",
    "publisher": {
      "@type": "Organization",
      "name": "7Types"
    }
  }

  return (
    <>
      <JsonLd data={librarySchema} />
      <TestLibraryPageClient />
    </>
  )
}
