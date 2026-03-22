import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import ClientPage from './client-page'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ testId?: string }> }): Promise<Metadata> {
  const sp = await searchParams
  const testId = sp.testId
  if (!testId) return { title: 'الاختبارات - Sami-Test' }
  
  const test = await (prisma as any).test.findFirst({
    where: {
      OR: [
        { id: isNaN(parseInt(testId, 10)) ? undefined : parseInt(testId, 10) },
        { slug: testId }
      ]
    }
  })

  if (!test) return { title: 'الاختبار غير موجود - Sami-Test' }

  return {
    title: test.seoTitle || `${test.name} - Sami-Test`,
    description: test.seoDescription || test.description?.substring(0, 160) || undefined,
    keywords: test.seoKeywords || undefined,
    openGraph: {
      title: test.seoTitle || test.name,
      description: test.seoDescription || test.description?.substring(0, 160) || '',
    }
  }
}

export default function TestPage() {
  return <ClientPage />
}
