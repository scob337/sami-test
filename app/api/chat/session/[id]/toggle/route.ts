import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return new NextResponse('Unauthorized', { status: 401 })
    
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, isAdmin: true }
    })
    if (!dbUser?.isAdmin) return new NextResponse('Forbidden', { status: 403 })

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
          senderId: dbUser.id,
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
