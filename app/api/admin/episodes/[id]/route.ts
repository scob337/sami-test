import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json()
    const { title, description, videoUrl, thumbnail, duration, isFree, sortOrder } = body

    const episode = await prisma.episode.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        videoUrl,
        thumbnail,
        duration,
        isFree,
        sortOrder: parseInt(sortOrder) || 0,
      }
    })

    return NextResponse.json(episode)
  } catch (error) {
    console.error('[ADMIN_EPISODE_PATCH]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await prisma.episode.delete({
      where: { id: parseInt(id) }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[ADMIN_EPISODE_DELETE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const episode = await prisma.episode.findUnique({
      where: { id: parseInt(id) }
    })

    if (!episode) {
      return new NextResponse('Not Found', { status: 404 })
    }

    return NextResponse.json(episode)
  } catch (error) {
    console.error('[ADMIN_EPISODE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
