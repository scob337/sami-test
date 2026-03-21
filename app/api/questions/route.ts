import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const testIdRaw = searchParams.get('testId')

    let targetTestId: number | undefined;

    if (testIdRaw) {
      const isNumeric = /^\d+$/.test(testIdRaw);
      if (isNumeric) {
        targetTestId = parseInt(testIdRaw);
      } else {
        const test = await (prisma as any).test.findUnique({
          where: { slug: testIdRaw },
          select: { id: true }
        });
        if (test) targetTestId = test.id;
      }
    }

    const questions = await prisma.question.findMany({
      where: { 
        isActive: true,
        ...(targetTestId ? { testId: targetTestId } : {})
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

    // Randomize options for each question for security/anti-cheating
    const shuffledQuestions = questions.map(q => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5)
    }))

    // Randomize questions order
    const finalShuffled = [...shuffledQuestions].sort(() => Math.random() - 0.5)

    return NextResponse.json(finalShuffled)
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
