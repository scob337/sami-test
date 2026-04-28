import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return new NextResponse('Unauthorized', { status: 401 })

    // Mark ALL unread notifications for this user as read
    await (prisma as any).userNotification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[NOTIFICATIONS_READ_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
