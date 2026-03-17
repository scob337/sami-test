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
      user = await prisma.user.findUnique({
        where: { id: numericId },
        include: {
          attempts: {
            where: { status: 'COMPLETED' },
            include: {
              result: true,
              test: {
                select: { name: true }
              }
            },
            orderBy: { completedAt: 'desc' },
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

      user = await prisma.user.findFirst({
        where: { OR: orConditions },
        include: {
          attempts: {
            where: { status: 'COMPLETED' },
            include: {
              result: true,
              test: {
                select: { name: true }
              }
            },
            orderBy: { completedAt: 'desc' },
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
      },
      attempts: user.attempts,
      books: user.payments.map(p => p.book),
    })
  } catch (error) {
    console.error('Error fetching user dashboard data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
