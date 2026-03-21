import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const { dbUserId, name, email, phone, avatarUrl } = await request.json()

    if (!dbUserId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const numericId = parseInt(dbUserId)
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 })
    }

    // Check if email is already taken by another user
    if (email && email.trim() !== '') {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.trim(),
          NOT: { id: numericId }
        }
      })
      if (existingUser) {
        return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 })
      }
    }

    // Check if phone is already taken by another user
    if (phone && phone.trim() !== '') {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: phone.trim(),
          NOT: { id: numericId }
        }
      })
      if (existingUser) {
        return NextResponse.json({ error: 'رقم الجوال مستخدم بالفعل' }, { status: 400 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: numericId },
      data: { 
        name, 
        email: email?.trim() || undefined, 
        phone: phone?.trim() || undefined, 
        avatarUrl 
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
