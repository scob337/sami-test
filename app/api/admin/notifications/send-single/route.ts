import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser || !authUser.email) return new NextResponse('Unauthorized', { status: 401 })
    
    const dbAdmin = await prisma.user.findUnique({
      where: { email: authUser.email },
      select: { isAdmin: true }
    })
    if (!dbAdmin?.isAdmin) return new NextResponse('Forbidden', { status: 403 })

    const { userId, title, content, type } = await req.json()
    if (!userId || !title || !content) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // 1. Create the general notification record
    const notification = await (prisma as any).notification.create({
      data: { 
        title, 
        content, 
        type: type || 'info',
        isActive: true
      }
    })

    // 2. Link it to the specific user
    const userNotification = await (prisma as any).userNotification.create({
      data: {
        userId: parseInt(userId),
        notificationId: notification.id,
        isRead: false
      }
    })

    return NextResponse.json({ notification, userNotification })
  } catch (error) {
    console.error('[NOTIFICATIONS_SEND_SINGLE_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
