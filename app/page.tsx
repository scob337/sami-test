import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LandingPage } from '@/components/home/landing-page'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/jwt'

export const metadata: Metadata = {
  title: 'بوصلة الشخصيات — اختبار وكتاب اعرف شخصيتك',
  description:
    'اختبار مجاني لاكتشاف شخصيتك من بين الشخصيات السبعة، ثم كتاب وتقرير يساعدانك تفهم نفسك والآخرين في العلاقات والعمل.',
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    url: 'https://7types.online',
    title: 'بوصلة الشخصيات — اختبار وكتاب اعرف شخصيتك',
    description: 'ابدأ الاختبار المجاني ثم اختر الباقة المناسبة: كتاب، تقرير، أو الاثنان معًا.',
  },
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>
}) {
  const { preview } = await searchParams
  const session = await getSession()
  // الأدمن يُوجَّه للوحة التحكم إلا إذا فتح المعاينة صراحةً (?preview=1)
  if (session?.isAdmin && preview !== '1') {
    redirect('/admin/dashboard')
  }

  const book = await prisma.book.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      tests: {
        where: { isActive: true },
        take: 1,
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!book) {
    return (
      <main className="min-h-screen flex flex-col overflow-hidden">
        <LandingPage book={null} />
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col overflow-hidden">
      <LandingPage
        book={{
          id: book.id,
          slug: book.slug,
          title: book.title,
          heroTitle: book.heroTitle,
          heroSubtitle: book.heroSubtitle,
          heroDescription: book.heroDescription,
          heroImage: book.heroImage,
          expertName: book.expertName,
          bookDetails: book.bookDetails as { image?: string; points?: string[] } | null,
          pricingPlans: book.pricingPlans,
          price: book.price,
          reportPrice: book.reportPrice,
          bookOnlyPrice: book.bookOnlyPrice,
          hasActiveTest: book.tests.length > 0,
          tests: book.tests.map((t) => ({
            id: t.id,
            slug: t.slug,
            name: t.name,
          })),
        }}
      />
    </main>
  )
}
