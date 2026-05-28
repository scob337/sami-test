import {
  AI_SYSTEM_PROMPT,
  REPORT_TYPE_PROMPTS,
  REPORT_OUTPUT_SCHEMA,
} from '@/lib/ai-prompts'

export function getDefaultPromptsPayload() {
  return {
    systemPrompt: AI_SYSTEM_PROMPT.trim(),
    reportRules: JSON.stringify(
      {
        byType: REPORT_TYPE_PROMPTS,
        outputSchema: REPORT_OUTPUT_SCHEMA,
      },
      null,
      2
    ),
  }
}

export function serializeReportTypePrompts(byType: Record<string, string>): string {
  return JSON.stringify({ byType, outputSchema: REPORT_OUTPUT_SCHEMA }, null, 2)
}

function parseReportRulesJson(reportRules: string): Record<string, string> | null {
  try {
    const parsed = JSON.parse(reportRules)
    if (parsed && typeof parsed === 'object') {
      if (parsed.byType && typeof parsed.byType === 'object') {
        return parsed.byType as Record<string, string>
      }
      const keys = Object.keys(REPORT_TYPE_PROMPTS)
      const hasTypeKeys = keys.some((k) => typeof parsed[k] === 'string')
      if (hasTypeKeys) {
        return parsed as Record<string, string>
      }
    }
  } catch {
    /* plain text */
  }
  return null
}

export function parseStoredReportRules(reportRules: string): {
  byType: Record<string, string>
  generalRules: string
} {
  const parsed = parseReportRulesJson(reportRules)
  if (parsed) {
    return {
      byType: { ...REPORT_TYPE_PROMPTS, ...parsed },
      generalRules: '',
    }
  }
  return {
    byType: { ...REPORT_TYPE_PROMPTS },
    generalRules: reportRules || '',
  }
}
