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
      select: { id: true }
    })
    
    if (!dbUser) return new NextResponse('Unauthorized', { status: 401 })

    // Mark ALL unread notifications for this user as read
    await (prisma as any).userNotification.updateMany({
        where: { userId: dbUser.id, isRead: false },
        data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[NOTIFICATIONS_READ_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
