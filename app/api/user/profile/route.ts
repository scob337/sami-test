import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const { userId, name, email, phone } = await request.json()

    if (!userId && (!email || email.trim() === '')) {
      return NextResponse.json({ error: 'identification is required' }, { status: 400 })
    }

    const numericId = parseInt(userId || '')
    let updatedUser;

    if (!isNaN(numericId)) {
      // Check if email is already taken by another user
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            NOT: { id: numericId }
          }
        })
        if (existingUser) {
          return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
        }
      }

      updatedUser = await prisma.user.update({
        where: { id: numericId },
        data: { name, email, phone }
      })
    } else if (email && email.trim() !== '') {
      updatedUser = await prisma.user.upsert({
        where: { email },
        update: { name, phone },
        create: { email, name: name || '', phone: phone || '' }
      })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
