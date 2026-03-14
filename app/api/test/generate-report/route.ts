import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

    if (!expertPrompt) {
      // Use default prompts if none found in DB
      console.warn('No Expert prompt found for testId:', testId)
    }

    // 2. Prepare payload for n8n
    const payload = {
      attemptId,
      testId,
      userData,
      answers,
      systemPrompt: expertPrompt?.systemPrompt || 'أنت خبير في تحليل الشخصية...',
      reportRules: expertPrompt?.reportRules || '1. ابدأ بترحيب...',
    }

    // 3. Trigger n8n Webhook
    // In a real app, the URL would be in .env
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'https://n8n.yourdomain.com/webhook/test-report'
    
    // For demonstration, we'll just log and simulate a response
    console.log('Triggering n8n with payload:', payload)
    
    /*
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const result = await n8nResponse.json()
    */

    // Simulated report for now
    const simulatedReport = `بناءً على إجاباتك، يظهر أنك تتمتع بشخصية ${userData?.name || 'متميزة'}. نمطك الأساسي يميل إلى الإبداع والقيادة...`

    // 4. Save report to DB
    const result = await prisma.result.findUnique({
      where: { attemptId: parseInt(attemptId) }
    })

    if (result) {
      await prisma.report.create({
        data: {
          resultId: result.id,
          reportText: simulatedReport,
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      report: simulatedReport 
    })

  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
