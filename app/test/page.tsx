import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import ClientPage from './client-page'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ testId?: string }> }): Promise<Metadata> {
  const sp = await searchParams
  const testId = sp.testId
  if (!testId) return { title: 'الاختبارات - 7Types' }
  
  const test = await (prisma as any).test.findFirst({
    where: {
      OR: [
        { id: isNaN(parseInt(testId, 10)) ? undefined : parseInt(testId, 10) },
        { slug: testId }
      ]
    }
  })

  if (!test) return { title: 'الاختبار غير موجود - 7Types' }

  return {
    title: test.seoTitle || `${test.name} - 7Types`,
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
