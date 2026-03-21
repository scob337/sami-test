import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const codes = await (prisma as any).discountCode.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(codes)
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, discount, type, expiresAt, isActive, courseId } = body

    const newCode = await (prisma as any).discountCode.create({
      data: {
        code,
        discount: parseFloat(discount),
        type: type || 'PERCENT',
        courseId: courseId ? parseInt(courseId) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(newCode)
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}
