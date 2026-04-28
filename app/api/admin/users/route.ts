import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) return new NextResponse('Forbidden', { status: 403 })

    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search')

    const users = await prisma.user.findMany({
      where: searchTerm ? {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm, mode: 'insensitive' } },
        ]
      } : undefined,
      include: {
        _count: {
          select: { attempts: true, payments: true }
        },
        attempts: {
          orderBy: { startedAt: 'desc' },
          take: 1,
          include: {
            result: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
