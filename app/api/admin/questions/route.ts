import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PatternType } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')

    const questions = await prisma.question.findMany({
      where: testId ? { testId: { equals: parseInt(testId) } } : undefined,
      include: {
        test: { select: { name: true } },
        options: {
          include: { scores: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json(questions)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { testId, questionText, sortOrder, options } = body

    if (!testId || !questionText) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    const question = await prisma.question.create({
      data: {
        testId: typeof testId === 'string' ? parseInt(testId) : testId,
        questionText,
        sortOrder: sortOrder || 0,
        options: {
          create: options.map((opt: any) => ({
            optionText: opt.optionText,
            sortOrder: opt.sortOrder || 0,
            scores: {
              create: opt.scores.map((score: any) => ({
                pattern: score.pattern as PatternType,
                score: score.score,
              }))
            }
          }))
        }
      },
      include: {
        options: {
          include: { scores: true },
        }
      }
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error creating question:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
