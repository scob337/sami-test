import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PromptUpdateInput } from '@/lib/types/admin'
import { serializeReportTypePrompts } from '@/lib/ai-prompt-utils'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')

    if (!testId) {
      return NextResponse.json({ error: 'Missing testId' }, { status: 400 })
    }

    const tid = parseInt(testId, 10)
    const aiPrompt = await prisma.aiPrompt.findFirst({
      where: { testId: tid },
    })

    return NextResponse.json(aiPrompt)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: PromptUpdateInput & {
      typePrompts?: Record<string, string>
    } = await request.json()
    const { testId, systemPrompt, reportRules, typePrompts } = body

    if (!testId || !systemPrompt) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    const tid = typeof testId === 'string' ? parseInt(testId, 10) : testId
    const rulesPayload =
      typePrompts && Object.keys(typePrompts).length > 0
        ? serializeReportTypePrompts(typePrompts)
        : reportRules || ''

    const existing = await prisma.aiPrompt.findFirst({
      where: { testId: tid },
    })

    const aiPrompt = existing
      ? await prisma.aiPrompt.update({
          where: { id: existing.id },
          data: {
            systemPrompt,
            reportRules: rulesPayload,
          },
        })
      : await prisma.aiPrompt.create({
          data: {
            testId: tid,
            systemPrompt,
            reportRules: rulesPayload,
          },
        })

    return NextResponse.json(aiPrompt)
  } catch (error) {
    console.error('Prompt save error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
