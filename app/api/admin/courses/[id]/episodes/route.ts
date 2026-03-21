import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const episodes = await prisma.episode.findMany({
      where: { courseId: parseInt(id) },
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json(episodes)
  } catch (error) {
    console.error('[ADMIN_EPISODES_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json()
    const { title, slug, description, videoUrl, videoUrl720, videoUrl1080, thumbnail, duration, isFree, sortOrder } = body

    if (!title || !videoUrl) {
        return new NextResponse('Title and Video URL are required', { status: 400 })
    }

    const episode = await prisma.episode.create({
      data: {
        title,
        slug: slug || (title ? slugify(title) : undefined),
        description,
        videoUrl,
        videoUrl720,
        videoUrl1080,
        thumbnail,
        duration,
        isFree: isFree ?? false,
        sortOrder: parseInt(sortOrder) || 0,
        courseId: parseInt(id)
      }
    })

    return NextResponse.json(episode)
  } catch (error) {
    console.error('[ADMIN_EPISODES_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
