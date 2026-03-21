import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return new NextResponse('Unauthorized', { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { email: user.email } })
    if (!dbUser) return new NextResponse('User not found', { status: 404 })

    const { episodeId, lastPos, isWatched } = await request.json()

    const progress = await prisma.userEpisodeProgress.upsert({
      where: {
        userId_episodeId: {
          userId: dbUser.id,
          episodeId: parseInt(episodeId)
        }
      },
      update: {
        lastPos: lastPos || undefined,
        isWatched: isWatched || false
      },
      create: {
        userId: dbUser.id,
        episodeId: parseInt(episodeId),
        lastPos: lastPos || 0,
        isWatched: isWatched || false
      }
    })

    return NextResponse.json(progress)
  } catch (error) {
    console.error('[EPISODE_PROGRESS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
     const { searchParams } = new URL(req.url)
     const episodeId = searchParams.get('episodeId')
     
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()
     if (!user || !user.email) return new NextResponse('Unauthorized', { status: 401 })
 
     const dbUser = await prisma.user.findUnique({ where: { email: user.email } })
     if (!dbUser) return new NextResponse('User not found', { status: 404 })
 
     const progress = await prisma.userEpisodeProgress.findUnique({
       where: {
         userId_episodeId: {
           userId: dbUser.id,
           episodeId: parseInt(episodeId || '0')
         }
       }
     })
 
     return NextResponse.json(progress || { lastPos: 0, isWatched: false })
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}
