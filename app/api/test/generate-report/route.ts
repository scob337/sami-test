import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

import { PERSONALITY_DETAILED_DATA } from '@/lib/constants/personality-data'

export async function POST(request: Request) {
  try {
    const { attemptId, testId, userData, answers } = await request.json()
    console.log('[GENERATE_REPORT] Start:', { attemptId, testId, hasAnswers: !!answers })

    if (!attemptId || !testId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // 0. Fetch the actual user from DB for accurate name
    const attempt = await prisma.attempt.findUnique({
      where: { id: parseInt(attemptId) },
      include: { user: true }
    })
    const realUserName = attempt?.user?.name || 'المبدع'

    // 1. Fetch Expert Prompt for this test
    const isNumericTestId = /^\d+$/.test(testId);
    let targetTestId = parseInt(testId);
    
    if (!isNumericTestId) {
      const test = await prisma.test.findUnique({
        where: { slug: testId },
        select: { id: true }
      });
      if (test) targetTestId = test.id;
    }

    const expertPrompt = await prisma.aiPrompt.findFirst({
      where: { testId: targetTestId }
    })

    // 1b. Fetch the actual result to get personality patterns
    const testResult = await prisma.result.findUnique({
      where: { attemptId: parseInt(attemptId) }
    })

    const primaryPattern = testResult?.primaryPattern || 'WISE'
    const secondaryPattern = testResult?.secondaryPattern || 'OPEN'

    const primaryData = PERSONALITY_DETAILED_DATA[primaryPattern] || {}
    const secondaryData = PERSONALITY_DETAILED_DATA[secondaryPattern] || {}

    const patternContext = `
النمط الأساسي: ${primaryData.name || primaryPattern}
الوصف: ${primaryData.description || ''}
نقاط القوة: ${primaryData.strengths || ''}
نقاط الضعف: ${primaryData.weaknesses || ''}

النمط الثانوي: ${secondaryData.name || secondaryPattern}
الوصف: ${secondaryData.description || ''}
نقاط القوة: ${secondaryData.strengths || ''}
`

    const systemPrompt = expertPrompt?.systemPrompt || 'أنت خبير في تحليل الشخصية...'
    const reportRules = expertPrompt?.reportRules || '1. ابدأ بترحيب...'

    // 2. Format answers for the prompt
    const formattedAnswers = answers?.map((a: any) => {
      return `السؤال: ${a.questionText || 'ID:' + a.questionId}\nالإجابة: ${a.optionText || 'ID:' + a.optionId}`
    }).join('\n\n')

    // 3. Generate report with Gemini
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')
    // Use canonical model names for 1.5
    let modelName = 'gemini-1.5-flash'
    let model = genAI.getGenerativeModel({ model: modelName })

    console.log('[GENERATE_REPORT] Calling Gemini:', modelName)

    const fullPrompt = `
${systemPrompt}

بيانات المستخدم:
الاسم: ${realUserName}
الجنس: ${userData?.user_metadata?.gender || 'غير معروف'}

تحليل الأنماط المكتشفة:
${patternContext}

نتائج الاختبار التفصيلية (إجابات المستخدم):
${formattedAnswers}

قواعد التقرير المطلوبة:
${reportRules}

الرجاء كتابة التقرير باللغة العربية بشكل احترافي ومنسق بناءً على الأنماط والبيانات المذكورة أعلاه.
`

    let generatedReport = ''
    try {
      const resultAI = await model.generateContent(fullPrompt)
      const responseAI = await resultAI.response
      generatedReport = responseAI.text()
      console.log('[GENERATE_REPORT] Gemini Success:', modelName)
    } catch (err: any) {
      console.error(`[GENERATE_REPORT] Gemini ${modelName} failed:`, err.message)
      modelName = 'gemini-1.5-pro'
      model = genAI.getGenerativeModel({ model: modelName })
      try {
        const resultAI = await model.generateContent(fullPrompt)
        const responseAI = await resultAI.response
        generatedReport = responseAI.text()
        console.log('[GENERATE_REPORT] Gemini Success (Fallback):', modelName)
      } catch (fallbackErr: any) {
        console.error(`[GENERATE_REPORT] Gemini ${modelName} fallback also failed:`, fallbackErr.message)
        throw fallbackErr
      }
    }

    // 4. Save report to DB
    const result = await prisma.result.findUnique({
      where: { attemptId: parseInt(attemptId) }
    })

    if (result) {
      // Check if report already exists to update it or create a new one
      const existingReport = await prisma.report.findUnique({
        where: { resultId: result.id }
      })

      if (existingReport) {
        await prisma.report.update({
          where: { id: existingReport.id },
          data: { reportText: generatedReport }
        })
      } else {
        await prisma.report.create({
          data: {
            resultId: result.id,
            reportText: generatedReport,
          }
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      report: generatedReport 
    })

  } catch (error: any) {
    console.error('[GENERATE_REPORT] Global Error:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}
