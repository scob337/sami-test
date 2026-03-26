import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

interface Course {
  id: number
  updatedAt: Date
}

interface Test {
  slug: string
  createdAt: Date
}

interface Book {
  slug: string
  createdAt: Date
}


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://7types.online'

  // Fetch all courses
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
  }) as unknown as Course[]

  // Fetch all tests
  const tests = await prisma.test.findMany({
    where: { isActive: true },
    select: { slug: true, createdAt: true },
  }) as unknown as Test[]

  // Fetch all books
  const books = await prisma.book.findMany({
    where: { isActive: true },
    select: { slug: true, createdAt: true },
  }) as unknown as Book[]

  const courseEntries = courses.map((course: Course) => ({
    url: `${baseUrl}/courses/${course.id}`,
    lastModified: course.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const testEntries = tests.map((test: Test) => ({
    url: `${baseUrl}/test?testId=${test.slug}`,
    lastModified: test.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const bookEntries = books.map((book: Book) => ({
    url: `${baseUrl}/test-library`, // Or individual book page if it exists
    lastModified: book.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const staticPages = [
    '',
    '/about',
    '/features',
    '/test-library',
    '/terms',
    '/privacy',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '' ? 1.0 : 0.5,
  }))

  return [...staticPages, ...courseEntries, ...testEntries, ...bookEntries]
}
