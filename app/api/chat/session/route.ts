import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })
    
    const chatSessionModel = (prisma as any).chatSession || (prisma as any).ChatSession

    // Find active session
    let session = await chatSessionModel.findFirst({
      where: { userId: user.id, isActive: true },
      orderBy: { updatedAt: 'desc' }
    })

    if (!session) {
      session = await chatSessionModel.create({
        data: { userId: user.id }
      })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('[CHAT_SESSION_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })
    
    const chatSessionModel = (prisma as any).chatSession || (prisma as any).ChatSession
    const sessions = await chatSessionModel.findMany({
      where: user.isAdmin ? {} : { userId: user.id },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { messages: { where: { isRead: false, isAdmin: !user.isAdmin } } } }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('[CHAT_SESSION_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
