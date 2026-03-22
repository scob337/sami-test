import { Metadata } from 'next'
import prisma from '@/lib/prisma'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  
  const course = (await prisma.course.findFirst({
    where: {
      OR: [
        { id: isNaN(parseInt(id, 10)) ? undefined : parseInt(id, 10) },
        { slug: id }
      ]
    }
  })) as any

  if (!course) return { title: 'الكورس غير موجود - Sami-Test' }

  return {
    title: course.seoTitle || `${course.title} - Sami-Test`,
    description: course.seoDescription || course.description?.substring(0, 160) || undefined,
    keywords: course.seoKeywords || undefined,
    openGraph: {
      title: course.seoTitle || course.title,
      description: course.seoDescription || course.description?.substring(0, 160) || '',
      images: course.image ? [course.image] : [],
    }
  }
}

export default function CourseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
