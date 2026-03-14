import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PatternType } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const question = await prisma.question.findUnique({
      where: { id: parseInt(id) },
      include: {
        options: {
          include: { scores: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    })
    if (!question) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(question)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { questionText, sortOrder, options } = body

    if (!questionText) {
      return NextResponse.json({ error: 'Missing question text' }, { status: 400 })
    }

    // Delete existing options (cascades to scores)
    await prisma.questionOption.deleteMany({
      where: { questionId: parseInt(id) },
    })

    // Update question and recreate options
    const question = await prisma.question.update({
      where: { id: parseInt(id) },
      data: {
        questionText,
        sortOrder: sortOrder ?? 0,
        options: {
          create: options.map((opt: any) => ({
            optionText: opt.optionText,
            sortOrder: opt.sortOrder ?? 0,
            scores: {
              create: opt.scores.map((score: any) => ({
                pattern: score.pattern as PatternType,
                score: score.score,
              })),
            },
          })),
        },
      },
      include: {
        options: {
          include: { scores: true },
        },
      },
    })

    return NextResponse.json(question)
  } catch (error) {
    console.error('Error updating question:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.question.delete({
      where: { id: parseInt(id) },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting question:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
