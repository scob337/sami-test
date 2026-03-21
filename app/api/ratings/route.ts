import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
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

    const body = await req.json()
    const { courseId, episodeId, value, comment } = body

    if (!value || value < 1 || value > 5) {
      return new NextResponse('Invalid rating value', { status: 400 })
    }

    const cId = courseId ? parseInt(courseId) : null;
    const eId = episodeId ? parseInt(episodeId) : null;

    if ((courseId && isNaN(cId as number)) || (episodeId && isNaN(eId as number))) {
      return new NextResponse('Invalid ID format', { status: 400 });
    }

    const rating = await prisma.rating.create({
      data: {
        value,
        comment,
        userId: dbUser.id,
        courseId: cId,
        episodeId: eId
      }
    })

    return NextResponse.json(rating)
  } catch (error) {
    console.error('[RATINGS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
