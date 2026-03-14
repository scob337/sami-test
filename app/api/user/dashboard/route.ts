import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        attempts: {
          where: { status: 'COMPLETED' },
          include: {
            result: true,
            test: {
              select: {
                name: true,
              }
            }
          },
          orderBy: {
            completedAt: 'desc',
          },
        },
        payments: {
          where: { status: 'COMPLETED' },
          include: {
            book: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

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
