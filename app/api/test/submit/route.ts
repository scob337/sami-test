import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PatternType } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const { answers, userId, testId, guestData } = await request.json()
    // answers is an array of { questionId: number, answerId: number }

    if (!answers || !Array.isArray(answers) || !testId) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // 1. Ensure a valid user exists
    let validUserId = parseInt(userId) || 0
    let user = validUserId > 0 ? await prisma.user.findUnique({ where: { id: validUserId } }) : null

    if (!user && guestData?.emailOrPhone) {
      // Check if user already exists by email or phone
      const isEmail = guestData.emailOrPhone.includes('@');
      user = await prisma.user.findFirst({
        where: isEmail ? { email: guestData.emailOrPhone } : { phone: guestData.emailOrPhone }
      });
    }

    if (!user) {
      // Create a guest user so the foreign key constraint is satisfied
      // Use guestData from the pre-test form if available
      user = await prisma.user.create({
        data: {
          name: guestData?.name || 'زائر',
          email: guestData?.emailOrPhone?.includes('@') ? guestData.emailOrPhone : null,
          phone: guestData?.emailOrPhone && !guestData?.emailOrPhone?.includes('@') ? guestData.emailOrPhone : null,
        },
      })
    }
    validUserId = user.id

    // 2. Calculate scores for each pattern
    // Get all patterns dynamically from the enum
    const patternScores = Object.values(PatternType).reduce((acc, curr) => {
      acc[curr as PatternType] = 0
      return acc
    }, {} as Record<PatternType, number>)

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

    const optionIds = validAnswers.map((a: any) => a.answerId)
    // Log for debugging
    console.log(`[SUBMIT] Processing ${validAnswers.length} valid answers from ${answers.length} total. Option IDs:`, optionIds)

    const scores = await prisma.optionScore.findMany({
      where: {
        optionId: { in: optionIds },
      },
    })

    console.log('DEBUG: validAnswers:', validAnswers.length)
    console.log('DEBUG: optionIds:', optionIds)
    console.log('DEBUG: scores found:', scores.length)
    console.log('DEBUG: scores details:', JSON.stringify(scores, null, 2))

    console.log(`[SUBMIT] Found ${scores.length} score records in DB for these options.`)
    if (scores.length < optionIds.length) {
      console.warn(`[SUBMIT] MISSING SCORES: Requested ${optionIds.length} options but only found ${scores.length} score records.`)
      // Identify which options are missing scores
      const foundOptionIds = new Set(scores.map(s => s.optionId))
      const missingOptionIds = optionIds.filter(id => !foundOptionIds.has(id))
      console.warn(`[SUBMIT] Options missing scores:`, missingOptionIds)
    }

    for (const score of scores) {
      patternScores[score.pattern] += score.score
    }
    console.log('[SUBMIT] Pattern scores summary:', patternScores)

    // 3. Determine Primary and Secondary patterns
    const sortedPatterns = (Object.entries(patternScores) as [PatternType, number][])
      .sort((a, b) => b[1] - a[1])

    const scoredPatterns = sortedPatterns.filter(([_, score]) => score > 0)
    
    const primaryPattern = scoredPatterns.length > 0 ? scoredPatterns[0][0] : sortedPatterns[0][0]
    // Only set secondary pattern if there's actually a second pattern with a score > 0
    const secondaryPattern = scoredPatterns.length > 1 ? scoredPatterns[1][0] : undefined

    const summaryAr = secondaryPattern 
      ? `نمطك الأساسي هو: ${primaryPattern}. وأنت تميل أيضاً إلى: ${secondaryPattern}.`
      : `نمطك الأساسي هو: ${primaryPattern}.`

    // 4. Save Attempt and Answers to DB
    const attempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        testId: parseInt(testId),
        status: 'COMPLETED',
        completedAt: new Date(),
        result: {
          create: {
            primaryPattern,
            secondaryPattern: (secondaryPattern || undefined) as any,
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
      summary_en: secondaryPattern 
        ? `Your primary pattern is ${primaryPattern}, and your secondary pattern is ${secondaryPattern}.`
        : `Your primary pattern is ${primaryPattern}.`,
    })

  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
