import 'server-only'

import prisma from '@/lib/prisma'
import {
  AI_SYSTEM_PROMPT,
  REPORT_TYPE_PROMPTS,
  REPORT_OUTPUT_SCHEMA,
} from '@/lib/ai-prompts'
import { parseStoredReportRules } from '@/lib/ai-prompt-utils'

export type ResolvedAiPrompts = {
  systemPrompt: string
  typePrompts: Record<string, string>
  outputSchemaHint: string
  source: 'database' | 'fallback'
}

/** يحمّل البرومبت من قاعدة البيانات مع fallback للملف الافتراضي — للسيرفر فقط */
export async function resolveAiPrompts(testId: number): Promise<ResolvedAiPrompts> {
  const row = await prisma.aiPrompt.findFirst({
    where: { testId },
  })

  if (!row) {
    return {
      systemPrompt: AI_SYSTEM_PROMPT,
      typePrompts: { ...REPORT_TYPE_PROMPTS },
      outputSchemaHint: JSON.stringify(REPORT_OUTPUT_SCHEMA, null, 2),
      source: 'fallback',
    }
  }

  const parsed = parseStoredReportRules(row.reportRules || '')
  let systemPrompt = row.systemPrompt || AI_SYSTEM_PROMPT
  if (parsed.generalRules) {
    systemPrompt = `${systemPrompt}\n\n--- قواعد إضافية ---\n${parsed.generalRules}`
  }

  return {
    systemPrompt,
    typePrompts: parsed.byType,
    outputSchemaHint: JSON.stringify(REPORT_OUTPUT_SCHEMA, null, 2),
    source: 'database',
  }
}
