import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return new NextResponse('Unauthorized', { status: 401 })
    
    const adminUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { isAdmin: true }
    })
    if (!adminUser?.isAdmin) return new NextResponse('Forbidden', { status: 403 })

    const numericId = parseInt(id)
    if (isNaN(numericId)) return new NextResponse('Invalid ID', { status: 400 })

    const targetUser = await (prisma as any).user.findUnique({
      where: { id: numericId },
      include: {
        enrollments: {
          include: { course: { select: { title: true, image: true, price: true } } }
        },
        attempts: { // Use 'attempts' or 'testAttempts' based on schema
          orderBy: { startedAt: 'desc' },
          take: 10,
          include: { test: { select: { name: true } } }
        },
        chatSessions: {
          orderBy: { updatedAt: 'desc' },
          take: 5
        }
      }
    })

    if (!targetUser) return new NextResponse('User Not Found', { status: 404 })

    return NextResponse.json(targetUser)
  } catch (error) {
    console.error('[ADMIN_USER_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
