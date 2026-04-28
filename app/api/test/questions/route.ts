import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const questions = await prisma.question.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    return NextResponse.json(
      { questions },
      { status: 200 }
    )
  } catch (error) {
    console.error('Questions fetch error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحميل الأسئلة' },
      { status: 500 }
    )
  }
}
