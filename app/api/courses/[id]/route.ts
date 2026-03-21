import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isNumericId = /^\d+$/.test(id);
    const course = await (prisma.course as any).findFirst({
      where: {
        OR: [
          { id: isNumericId ? parseInt(id) : undefined },
          { slug: id }
        ],
        isActive: true
      },
      include: {
        episodes: {
          orderBy: { sortOrder: 'asc' }
        },
        ratings: {
          include: {
            user: {
              select: { name: true, avatarUrl: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    })

    if (!course) {
      return new NextResponse('Not Found', { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('[COURSE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
