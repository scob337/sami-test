import { NextResponse } from 'next/server'
import { getSession } from '@/lib/jwt'
import { findUserById } from '@/lib/db/auth-repository'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || !session.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const dbUser = await findUserById(Number(session.id))

    if (!dbUser) {
       return new NextResponse('User not found', { status: 404 })
    }

    return NextResponse.json({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      phone: dbUser.phone,
      isAdmin: dbUser.isAdmin,
    })
  } catch (error) {
    console.error('[AUTH_ME]', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}
