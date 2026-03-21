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
    if (!dbUser) return new NextResponse('Unauthorized', { status: 401 })

    const { sessionId } = await req.json()
    if (!sessionId) return new NextResponse('Missing Session ID', { status: 400 })

    const messageModel = (prisma as any).message || (prisma as any).Message

    // Mark messages from the OTHER side as read
    await messageModel.updateMany({
      where: {
        sessionId: parseInt(sessionId),
        isAdmin: !dbUser.isAdmin, 
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
