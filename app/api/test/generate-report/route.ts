import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import OpenAI from 'openai'
import { REPORT_OUTPUT_SCHEMA } from '@/lib/ai-prompts'
import { resolveAiPrompts } from '@/lib/ai-prompt-service'
import { PERSONALITY_DETAILED_DATA } from '@/lib/constants/personality-data'

export async function POST(request: Request) {
  try {
    const { attemptId, testId, userData, answers, reportType = 'free', reportMode = 'free' } = await request.json()
    console.log('[GENERATE_REPORT] Start:', { attemptId, testId, reportType, reportMode })

    if (!attemptId || !testId) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 })
    }

    // 0. Fetch the actual user and attempt
    const attempt = await prisma.attempt.findUnique({
      where: { id: parseInt(attemptId) },
      include: { user: true, test: true }
    })

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    const realUserName = attempt.user?.name || 'المبدع'

    // 1. Fetch the actual result to get personality patterns and scores
    const testResult = await prisma.result.findUnique({
      where: { attemptId: parseInt(attemptId) }
    })

    if (!testResult) {
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
    }

    const primaryPattern = testResult.primaryPattern
    const secondaryPattern = testResult.secondaryPattern
    const scores = testResult.scoresJson as Record<string, number>

    const primaryData = PERSONALITY_DETAILED_DATA[primaryPattern] || {}
    const secondaryData = secondaryPattern ? (PERSONALITY_DETAILED_DATA[secondaryPattern] || {}) : {}

    // 2. Prepare Input JSON for AI
    const inputJson = {
      report_mode: reportMode,
      report_type: reportType,
      primary_type: primaryData.name || primaryPattern,
      secondary_type: secondaryData.name || secondaryPattern || null,
      type_scores: scores,
      user_name: realUserName,
      report_context: `نتيجة اختبار شخصية بعنوان: ${attempt.test.name}`,
    }

    // 3. Format answers for context
    const formattedAnswers = answers?.map((a: any) => {
      return `السؤال: ${a.questionText || 'ID:' + a.questionId}\nالإجابة: ${a.optionText || 'ID:' + a.optionId}`
    }).join('\n\n')

    const resolvedTestId =
      typeof testId === 'string' && !isNaN(parseInt(testId, 10))
        ? parseInt(testId, 10)
        : attempt.testId

    const aiPrompts = await resolveAiPrompts(resolvedTestId)
    const typePrompt =
      aiPrompts.typePrompts[reportType] ||
      aiPrompts.typePrompts.free ||
      ''

    const userPrompt = `
بيانات المدخلات (Input JSON):
${JSON.stringify(inputJson, null, 2)}

إجابات المستخدم التفصيلية:
${formattedAnswers}

الرجاء كتابة التقرير باللغة العربية بناءً على البيانات أعلاه واتباع هيكل الـ Output Schema المحدد:
${aiPrompts.outputSchemaHint}
`

    // 4. Generate report with OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || ''
    })
    
    let modelName = 'gpt-4o'
    console.log('[GENERATE_REPORT] Calling ChatGPT:', modelName)

    let reportData = null
    try {
      const completion = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: aiPrompts.systemPrompt + '\n' + typePrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      })
      
      const content = completion.choices[0]?.message?.content || '{}'
      reportData = JSON.parse(content)
      console.log('[GENERATE_REPORT] ChatGPT Success:', modelName)
    } catch (err: any) {
      console.error(`[GENERATE_REPORT] ChatGPT ${modelName} failed:`, err.message)
      // Fallback to gpt-4o-mini
      modelName = 'gpt-4o-mini'
      const fallbackCompletion = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: aiPrompts.systemPrompt + '\n' + typePrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      })
      const content = fallbackCompletion.choices[0]?.message?.content || '{}'
      reportData = JSON.parse(content)
    }

    // 5. Save report to DB
    const existingReport = await prisma.report.findUnique({
      where: { resultId: testResult.id }
    })

    if (existingReport) {
      await prisma.report.update({
        where: { id: existingReport.id },
        data: { 
          reportData: reportData as any,
          reportText: reportData.opening_insight || '' // Fallback text
        }
      })
    } else {
      await prisma.report.create({
        data: {
          resultId: testResult.id,
          reportData: reportData as any,
          reportText: reportData.opening_insight || ''
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      report: reportData 
    })

  } catch (error: any) {
    console.error('[GENERATE_REPORT] Global Error:', error)
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message
    }, { status: 500 })
  }
}
