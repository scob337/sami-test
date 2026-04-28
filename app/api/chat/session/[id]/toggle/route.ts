import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) return new NextResponse('Forbidden', { status: 403 })

    const { id } = await params

    const session = await (prisma as any).chatSession.findUnique({
      where: { id: parseInt(id) }
    })

    if (!session) return new NextResponse('Session Not Found', { status: 404 })

    const newIsActive = !session.isActive

    const updated = await (prisma as any).chatSession.update({
      where: { id: parseInt(id) },
      data: { isActive: newIsActive }
    })

    // Send system message when closing the session
    if (!newIsActive) {
      const messageModel = (prisma as any).message || (prisma as any).Message
      await messageModel.create({
        data: {
          sessionId: parseInt(id),
          senderId: user.id,
          content: '⛔ تم إنهاء هذه المحادثة من قبل الإدارة. لا يمكن إرسال رسائل جديدة.',
          isAdmin: true,
          isRead: false
        }
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('[CHAT_SESSION_TOGGLE]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
