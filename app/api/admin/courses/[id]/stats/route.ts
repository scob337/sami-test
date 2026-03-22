import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return new NextResponse('Unauthorized', { status: 401 })
    
    const adminUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { isAdmin: true }
    })
    if (!adminUser?.isAdmin) return new NextResponse('Forbidden', { status: 403 })

    const numericId = parseInt(id)
    if (isNaN(numericId)) return new NextResponse('Invalid ID', { status: 400 })

    const course = await prisma.course.findUnique({
      where: { id: numericId },
      include: {
        _count: {
          select: {
            enrollments: true,
            ratings: true,
          }
        },
        payments: {
          where: { status: 'COMPLETED' },
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            discountCode: { select: { code: true, discount: true, type: true } }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!course) return new NextResponse('Course Not Found', { status: 404 })

    // Calculate total revenue
    const totalRevenue = course.payments.reduce((acc, payment) => acc + (payment.amount || 0), 0)

    // Calculate enrollments (sometimes users get enrolled for free, so enrollments might be > payments)
    const subscribers = await prisma.userCourse.findMany({
      where: { courseId: numericId },
      include: {
        user: { select: { id: true, name: true, email: true, createdAt: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
       course: {
         id: course.id,
         title: course.title,
         price: course.price,
         image: course.image,
         isActive: course.isActive,
         stats: {
           revenue: totalRevenue,
           enrollments: course._count.enrollments,
           ratings: course._count.ratings
         }
       },
       payments: course.payments,
       subscribers
    })
  } catch (error) {
    console.error('[ADMIN_COURSE_STATS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
