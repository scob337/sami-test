import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const { episodeId, lastPos, isWatched } = await req.json()

    const progress = await prisma.userEpisodeProgress.upsert({
      where: {
        userId_episodeId: {
          userId: user.id,
          episodeId: parseInt(episodeId)
        }
      },
      update: {
        lastPos: lastPos || undefined,
        isWatched: isWatched || false
      },
      create: {
        userId: user.id,
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
     
     const user = await getAuthenticatedUser()
     if (!user) return new NextResponse('Unauthorized', { status: 401 })
 
     const progress = await prisma.userEpisodeProgress.findUnique({
       where: {
         userId_episodeId: {
           userId: user.id,
           episodeId: parseInt(episodeId || '0')
         }
       }
     })
 
     return NextResponse.json(progress || { lastPos: 0, isWatched: false })
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}
