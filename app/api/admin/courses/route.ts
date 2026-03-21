import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const courses = await (prisma as any).course.findMany({
      include: {
        _count: {
          select: {
            episodes: true,
            enrollments: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('[ADMIN_COURSES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { title, description, price, image, introVideoUrl, introThumbnailUrl, isActive } = body

    if (!title) {
        return new NextResponse('Title is required', { status: 400 })
    }

    const course = await (prisma as any).course.create({
      data: {
        title,
        slug: slugify(title),
        description,
        price: parseFloat(price) || 0,
        image,
        introVideoUrl,
        introThumbnailUrl,
        isActive: isActive ?? true,
        episodes: {
          create: (body.episodes || []).map((ep: any, idx: number) => ({
            title: ep.title || `Episode ${idx + 1}`,
            description: ep.description || '',
            videoUrl: ep.videoUrl,
            thumbnail: ep.thumbnail || '',
            duration: ep.duration || '',
            isFree: ep.isFree || false,
            sortOrder: idx
          }))
        }
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error('[ADMIN_COURSES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
