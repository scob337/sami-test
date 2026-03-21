import prisma from '@/lib/prisma'

/**
 * Create a notification and deliver it to specific users
 */
export async function createUserNotification({
  userId,
  title,
  content,
  type = 'info',
  link
}: {
  userId: number
  title: string
  content: string
  type?: 'info' | 'warning' | 'success'
  link?: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        content,
        type,
        link,
        users: {
          create: {
            userId
          }
        }
      }
    })
    return notification
  } catch (error) {
    console.error('[CREATE_NOTIFICATION]', error)
    throw error
  }
}

/**
 * Broadcast a notification to all non-admin users
 */
export async function broadcastNotification({
  title,
  content,
  type = 'info',
  link
}: {
  title: string
  content: string
  type?: 'info' | 'warning' | 'success'
  link?: string
}) {
  try {
    const users = await prisma.user.findMany({
      where: { isAdmin: false },
      select: { id: true }
    })

    const notification = await prisma.notification.create({
      data: {
        title,
        content,
        type,
        link,
        users: {
          create: users.map(u => ({ userId: u.id }))
        }
      }
    })
    return notification
  } catch (error) {
    console.error('[BROADCAST_NOTIFICATION]', error)
    throw error
  }
}
