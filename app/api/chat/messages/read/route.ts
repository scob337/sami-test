import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    const { sessionId } = await req.json()
    if (!sessionId) return new NextResponse('Missing Session ID', { status: 400 })

    const messageModel = (prisma as any).message || (prisma as any).Message

    // Mark messages from the OTHER side as read
    await messageModel.updateMany({
      where: {
        sessionId: parseInt(sessionId),
        isAdmin: !user.isAdmin, 
        isRead: false
      },
      data: { isRead: true }
    })

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[MESSAGES_READ_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
