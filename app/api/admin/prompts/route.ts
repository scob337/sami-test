import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PromptUpdateInput } from '@/lib/types/admin'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')

    if (!testId) {
      return NextResponse.json({ error: 'Missing testId' }, { status: 400 })
    }

    const aiPrompt = await prisma.aiPrompt.findFirst({
      where: { testId: parseInt(testId) }
    })

    return NextResponse.json(aiPrompt)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: PromptUpdateInput = await request.json()
    const { testId, systemPrompt, reportRules } = body

    if (!testId || !systemPrompt || !reportRules) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    const aiPrompt = await prisma.aiPrompt.upsert({
      where: { 
        id: body.id || -1 
      },
      update: {
        systemPrompt,
        reportRules,
      },
      create: {
        testId: typeof testId === 'string' ? parseInt(testId) : testId,
        systemPrompt,
        reportRules,
      }
    })

    return NextResponse.json(aiPrompt)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
