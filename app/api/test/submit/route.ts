import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PatternType } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const { answers, userId, testId } = await request.json()
    // answers is an array of { questionId: number, answerId: number }

    if (!answers || !Array.isArray(answers) || !testId) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // 1. Ensure a valid user exists
    let validUserId = parseInt(userId) || 0
    let user = validUserId > 0 ? await prisma.user.findUnique({ where: { id: validUserId } }) : null

    if (!user) {
      // Create a guest user so the foreign key constraint is satisfied
      user = await prisma.user.create({
        data: {
          name: 'زائر',
          email: null,
          phone: null,
        },
      })
    }
    validUserId = user.id

    // 2. Calculate scores for each pattern
    const patternScores: Record<PatternType, number> = {
      [PatternType.ASSERTIVE]: 0,
      [PatternType.PRECISE]: 0,
      [PatternType.CALM]: 0,
      [PatternType.WISE]: 0,
      [PatternType.SPONTANEOUS]: 0,
      [PatternType.OPEN]: 0,
      [PatternType.THINKER]: 0,
    }

    const optionIds = answers.map((a: any) => a.answerId)
    const questionIds = answers.map((a: any) => a.questionId)

    // Verify all questionIds exist in the DB to avoid P2003
    const dbQuestions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true }
    })
    const validQuestionIds = new Set(dbQuestions.map(q => q.id))

    const validAnswers = answers.filter((a: any) => 
      validQuestionIds.has(a.questionId) && a.answerId && a.questionId
    )

    if (validAnswers.length === 0) {
      return NextResponse.json({ error: 'No valid answers provided' }, { status: 400 })
    }

    const scores = await prisma.optionScore.findMany({
      where: {
        optionId: { in: optionIds },
      },
    })

    for (const score of scores) {
      patternScores[score.pattern] += score.score
    }

    // 3. Determine Primary and Secondary patterns
    const sortedPatterns = (Object.entries(patternScores) as [PatternType, number][])
      .sort((a, b) => b[1] - a[1])

    const primaryPattern = sortedPatterns[0][0]
    const secondaryPattern = sortedPatterns[1][0]

    const summaryAr = `نمطك الأساسي هو: ${primaryPattern}. وأنت تميل أيضاً إلى: ${secondaryPattern}.`

    // 4. Save Attempt and Answers to DB
    const attempt = await prisma.attempt.create({
      data: {
        userId: validUserId,
        testId: parseInt(testId),
        status: 'COMPLETED',
        completedAt: new Date(),
        result: {
          create: {
            primaryPattern,
            secondaryPattern,
            scoresJson: patternScores as any,
          },
        },
      },
      include: {
        result: true,
      }
    })

    // 5. Save individual answers linked to the attempt
    await prisma.answer.createMany({
      data: validAnswers.map((a: any) => ({
        attemptId: attempt.id,
        questionId: a.questionId,
        optionId: a.answerId,
      })),
    })

    return NextResponse.json({
      attemptId: attempt.id,
      primaryPattern,
      secondaryPattern,
      scores: patternScores,
      summary_ar: summaryAr,
      summary_en: `Your primary pattern is ${primaryPattern}, and your secondary pattern is ${secondaryPattern}.`,
    })

  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
