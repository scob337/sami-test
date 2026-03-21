import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { code, courseId, bookId, testId, userId } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    const discountCode = await (prisma as any).discountCode.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!discountCode) {
      return NextResponse.json({ error: 'كود الخصم غير صحيح' }, { status: 404 })
    }

    // Check if expired
    if (discountCode.expiresAt && new Date() > discountCode.expiresAt) {
      return NextResponse.json({ error: 'كود الخصم منتهي الصلاحية' }, { status: 400 })
    }

    if (!discountCode.isActive) {
      return NextResponse.json({ error: 'كود الخصم غير مفعل' }, { status: 400 })
    }

    if (discountCode.courseId) {
      if (!courseId) {
        return NextResponse.json({ error: 'كود الخصم هذا مخصص لكورس معين' }, { status: 400 })
      }
      if (parseInt(courseId) !== discountCode.courseId) {
        return NextResponse.json({ error: 'كود الخصم غير صالح لهذا الكورس' }, { status: 400 })
      }
    }

    return NextResponse.json({
      id: discountCode.id,
      amount: discountCode.discount,
      type: discountCode.type, // PERCENTAGE or FIXED (PERCENT or FIXED in DB)
    })
  } catch (error) {
    console.error('Discount Validation Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
