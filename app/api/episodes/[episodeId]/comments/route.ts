import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const { episodeId } = await params;
    const id = parseInt(episodeId);

    if (isNaN(id)) {
      return new NextResponse('Invalid episode ID', { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: { episodeId: id },
      include: {
        user: {
          select: { name: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('[COMMENTS_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ episodeId: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 })
    }

    const { episodeId } = await params;
    const id = parseInt(episodeId);

    if (isNaN(id)) {
      return new NextResponse('Invalid episode ID', { status: 400 });
    }

    const { content } = await req.json()

    if (!content) {
      return new NextResponse('Content is required', { status: 400 })
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: dbUser.id,
        episodeId: id
      },
      include: {
        user: { select: { name: true, avatarUrl: true } }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('[COMMENTS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
