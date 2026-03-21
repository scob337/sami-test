import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return new NextResponse('Unauthorized', { status: 401 })
    
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, isAdmin: true, phone: true }
    })
    
    // Auto-create user if not in DB
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          phone: user.user_metadata?.phone || '',
          name: user.user_metadata?.name || user.email.split('@')[0],
          isAdmin: false
        },
        select: { id: true, isAdmin: true, phone: true }
      })
    }
    
    const chatSessionModel = (prisma as any).chatSession || (prisma as any).ChatSession

    // Find active session
    let session = await chatSessionModel.findFirst({
      where: { userId: dbUser.id, isActive: true },
      orderBy: { updatedAt: 'desc' }
    })

    if (!session) {
      session = await chatSessionModel.create({
        data: { userId: dbUser.id }
      })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error('[CHAT_SESSION_POST]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return new NextResponse('Unauthorized', { status: 401 })
    
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, isAdmin: true, phone: true }
    })
    
    if (!dbUser) {
       // Also auto-create here if GET is called first
       dbUser = await prisma.user.create({
         data: {
           email: user.email,
           phone: user.user_metadata?.phone || '',
           name: user.user_metadata?.name || user.email.split('@')[0],
           isAdmin: false
         },
         select: { id: true, isAdmin: true, phone: true }
       })
    }

    const chatSessionModel = (prisma as any).chatSession || (prisma as any).ChatSession
    const sessions = await chatSessionModel.findMany({
      where: dbUser.isAdmin ? {} : { userId: dbUser.id },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { messages: { where: { isRead: false, isAdmin: !dbUser.isAdmin } } } }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('[CHAT_SESSION_GET]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
