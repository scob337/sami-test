import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return new NextResponse('Unauthorized', { status: 401 })
    
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, isAdmin: true }
    })
    if (!dbUser) return new NextResponse('User not found in DB', { status: 404 })

    const { sessionId, content, isAdmin } = await req.json()

    // Block messages on closed sessions
    const chatSession = await (prisma as any).chatSession.findUnique({
      where: { id: parseInt(sessionId) },
      select: { isActive: true }
    })
    if (!chatSession) return new NextResponse('Session not found', { status: 404 })
    if (!chatSession.isActive) return new NextResponse('هذه المحادثة مغلقة ولا يمكن إرسال رسائل جديدة', { status: 403 })

    const message = await (prisma as any).message.create({
      data: {
        sessionId: parseInt(sessionId),
        senderId: dbUser.id,
        content,
        isAdmin: !!dbUser.isAdmin && !!isAdmin
      }
    })

    // Update session timestamp
    await (prisma as any).chatSession.update({
      where: { id: parseInt(sessionId) },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('[CHAT_MESSAGE_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    if (!sessionId) return new NextResponse('Missing sessionId', { status: 400 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return new NextResponse('Unauthorized', { status: 401 })
    
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, isAdmin: true }
    })
    if (!dbUser) return new NextResponse('User not found in DB', { status: 404 })

    const messages = await (prisma as any).message.findMany({
      where: { sessionId: parseInt(sessionId) },
      include: {
        sender: {
          select: { name: true, isAdmin: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Mark as read if user is the opposite role of the last unread message
    // Simplistic: mark all read by others as read by me
    await (prisma as any).message.updateMany({
      where: { 
        sessionId: parseInt(sessionId),
        isAdmin: !dbUser.isAdmin,
        isRead: false
      },
      data: { isRead: true }
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('[CHAT_MESSAGE_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
