import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { episodes: true, enrollments: true }
        }
      }
    })
    return NextResponse.json(courses)
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      title, slug, price, description, image, introVideoUrl, 
      videoUrl720, videoUrl1080, introThumbnailUrl, isActive,
      seoTitle, seoDescription, seoKeywords
    } = body
 
    const course = await prisma.course.create({
      data: {
        title,
        slug: slug || slugify(title),
        price: parseFloat(price),
        description,
        image,
        introVideoUrl,
        videoUrl720,
        videoUrl1080,
        introThumbnailUrl,
        isActive: isActive ?? true,
        seoTitle,
        seoDescription,
        seoKeywords,
        episodes: {
          create: (body.episodes || []).map((ep: any, idx: number) => ({
            title: ep.title || `Episode ${idx + 1}`,
            slug: ep.slug || slugify(ep.title || `Episode ${idx + 1}`),
            description: ep.description || '',
            videoUrl: ep.videoUrl,
            videoUrl720: ep.videoUrl720,
            videoUrl1080: ep.videoUrl1080,
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
    console.error('[COURSES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
