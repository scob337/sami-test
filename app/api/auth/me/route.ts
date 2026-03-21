import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !user.email) return new NextResponse('Unauthorized', { status: 401 })

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true, name: true, isAdmin: true }
    })

    if (!dbUser) {
      return NextResponse.json({ isAdmin: false, name: '' })
    }

    return NextResponse.json(dbUser)
  } catch (error) {
    console.error('[AUTH_ME]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
