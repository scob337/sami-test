import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')

    const questions = await prisma.question.findMany({
      where: { 
        isActive: true,
        ...(testId ? { testId: parseInt(testId) } : {})
      },
      include: {
        options: {
          include: {
            scores: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    // Randomize questions if requested
    const shuffled = [...questions].sort(() => Math.random() - 0.5)

    return NextResponse.json(shuffled)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
