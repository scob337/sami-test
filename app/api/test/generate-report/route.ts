import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

import { PERSONALITY_DETAILED_DATA } from '@/lib/constants/personality-data'

export async function POST(request: Request) {
  try {
    const { attemptId, testId, userData, answers } = await request.json()

    if (!attemptId || !testId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // 1. Fetch Expert Prompt for this test
    const expertPrompt = await prisma.aiPrompt.findFirst({
      where: { testId: parseInt(testId) }
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
    // Use stable aliases found via ListModels
    let modelName = 'gemini-flash-latest'
    let model = genAI.getGenerativeModel({ model: modelName })

    const fullPrompt = `
${systemPrompt}

بيانات المستخدم:
الاسم: ${userData?.user_metadata?.fullName || 'غير معروف'}
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
    } catch (err: any) {
      console.warn(`Gemini ${modelName} failed, falling back to gemini-pro-latest:`, err.message)
      modelName = 'gemini-pro-latest'
      model = genAI.getGenerativeModel({ model: modelName })
      const resultAI = await model.generateContent(fullPrompt)
      const responseAI = await resultAI.response
      generatedReport = responseAI.text()
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

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
