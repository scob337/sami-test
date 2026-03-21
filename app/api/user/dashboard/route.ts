import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const phone = searchParams.get('phone')

    if (!userId && !email && !phone) {
      return NextResponse.json({ error: 'identification is required' }, { status: 400 })
    }

    let user;
    const isNumericId = userId && /^\d+$/.test(userId)
    const numericId = isNumericId ? parseInt(userId) : NaN
    
    if (isNumericId && !isNaN(numericId)) {
      user = await (prisma.user.findUnique as any)({
        where: { id: numericId },
        include: {
          attempts: {
            include: {
              result: {
                include: { report: true }
              },
              payment: true,
              test: {
                include: { book: true }
              }
            },
            orderBy: { startedAt: 'desc' },
          },
          payments: {
            where: { status: 'COMPLETED' },
            include: { book: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      })
    }

    if (!user && ((email && email.trim() !== '') || (phone && phone.trim() !== ''))) {
      const emailVal = email?.trim()
      const phoneVal = phone?.trim()
      
      const orConditions = []
      if (emailVal) orConditions.push({ email: emailVal })
      if (phoneVal) orConditions.push({ phone: phoneVal })

      user = await (prisma.user.findFirst as any)({
        where: { OR: orConditions },
        include: {
          attempts: {
            include: {
              result: {
                include: { report: true }
              },
              payment: true,
              test: {
                include: { book: true }
              }
            },
            orderBy: { startedAt: 'desc' },
          },
          payments: {
            where: { status: 'COMPLETED' },
            include: { book: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      // If user not found in Prisma but we have identifiers, create them (Safety sync)
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: emailVal || undefined,
            phone: phoneVal || '',
            name: emailVal ? emailVal.split('@')[0] : 'User',
            isAdmin: false
          },
          include: {
            attempts: true,
            payments: { include: { book: true } }
          }
        })
      }
    }

    const finalUser = user as any
    if (!finalUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Fetch user notifications
    const notifications = await (prisma as any).userNotification.findMany({
      where: { userId: finalUser.id },
      include: { notification: true },
      orderBy: { createdAt: 'desc' },
      take: 20
    })

    // Fetch enrolled courses
    const enrolledCourses = await (prisma as any).userCourse?.findMany?.({
      where: { userId: finalUser.id },
      include: { course: true },
      orderBy: { createdAt: 'desc' }
    }) || []

    return NextResponse.json({
      user: {
        id: finalUser.id,
        name: finalUser.name,
        email: finalUser.email,
        phone: finalUser.phone,
        avatarUrl: finalUser.avatarUrl,
        createdAt: finalUser.createdAt,
      },
      attempts: finalUser.attempts || [],
      books: (finalUser.payments || []).map((p: any) => p.book).filter(Boolean),
      notifications,
      enrolledCourses: enrolledCourses.map((e: any) => e.course).filter(Boolean),
    })
  } catch (error) {
    console.error('Error fetching user dashboard data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
