import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId || isNaN(parseInt(userId))) {
      return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 })
    }

    const attempts = await prisma.attempt.findMany({
      where: {
        userId: parseInt(userId),
        status: 'COMPLETED',
      },
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
    })

    return NextResponse.json({ attempts })
  } catch (error) {
    console.error('Error fetching user dashboard data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
