import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) return new NextResponse('Forbidden', { status: 403 })

    const { title, content, type } = await req.json()

    // Create the notification
    const notification = await (prisma as any).notification.create({
      data: { title, content, type: type || 'info' }
    })

    // Create UserNotification for ALL non-admin users so it shows in their bell
    const allUsers = await prisma.user.findMany({
      where: { isAdmin: false },
      select: { id: true }
    })

    if (allUsers.length > 0) {
      await (prisma as any).userNotification.createMany({
        data: allUsers.map(u => ({
          userId: u.id,
          notificationId: notification.id,
          isRead: false
        }))
      })
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error('[NOTIFICATIONS_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const notifications = await (prisma as any).notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    })
    return NextResponse.json(notifications)
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user || !user.isAdmin) return new NextResponse('Forbidden', { status: 403 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return new NextResponse('Missing ID', { status: 400 })

    await (prisma as any).notification.delete({
      where: { id: parseInt(id) }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}
