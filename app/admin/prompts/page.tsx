'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Save, RefreshCw, MessageSquare, Sparkles, Wand2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { REPORT_TYPE_PROMPTS } from '@/lib/ai-prompts'
import {
  getDefaultPromptsPayload,
  parseStoredReportRules,
} from '@/lib/ai-prompt-utils'

const REPORT_TYPE_LABELS: Record<string, string> = {
  free: 'تقرير مجاني',
  personality: 'تقرير الشخصية',
  marriage: 'التوافق الزواجي',
  leadership: 'القيادة',
  hiring: 'التوظيف',
  sales: 'المبيعات',
  full: 'التقرير الكامل',
}

interface AIPrompt {
  id: number
  testId: number
  systemPrompt: string
  reportRules: string
}

export default function PromptsPage() {
  const [selectedTest, setSelectedTest] = useState('1')

  const { data: testsData } = useSWR<any[]>('/api/admin/tests', fetcher)
  const {
    data: promptData,
    isLoading: isLoadingPrompt,
    mutate,
  } = useSWR<AIPrompt | null>(
    selectedTest ? `/api/admin/prompts?testId=${selectedTest}` : null,
    fetcher
  )

  const tests = testsData || []

  const [systemPrompt, setSystemPrompt] = useState('')
  const [typePrompts, setTypePrompts] = useState<Record<string, string>>({
    ...REPORT_TYPE_PROMPTS,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [promptId, setPromptId] = useState<number | null>(null)

  useEffect(() => {
    if (promptData) {
      setSystemPrompt(promptData.systemPrompt || '')
      const parsed = parseStoredReportRules(promptData.reportRules || '')
      setTypePrompts(parsed.byType)
      setPromptId(promptData.id || null)
    } else if (promptData === null && !isLoadingPrompt) {
      applyDefaults(false)
    }
  }, [promptData, isLoadingPrompt])

  const applyDefaults = (notify = true) => {
    const defaults = getDefaultPromptsPayload()
    setSystemPrompt(defaults.systemPrompt)
    const parsed = parseStoredReportRules(defaults.reportRules)
    setTypePrompts(parsed.byType)
    if (notify) toast.success('تم تحميل البرومبت الافتراضي — احفظ لتخزينه في قاعدة البيانات')
  }

  const isLoading = !testsData || (selectedTest && isLoadingPrompt)

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: promptId,
          testId: selectedTest,
          systemPrompt,
          typePrompts,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      mutate()
      toast.success('تم حفظ البرومبت في قاعدة البيانات — التقارير الجديدة ستستخدمه')
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg p-2">
            <img src="/Logo.png" alt="7Types" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              إدارة برومبت التقارير (AI)
            </h2>
            <p className="text-muted-foreground font-medium mt-1">
              مُخزَّن في قاعدة البيانات — يُستخدم عند توليد التقارير وليس من الكود
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={() => applyDefaults(true)}
            className="h-12 px-6 rounded-xl font-bold border-border"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            استعادة الافتراضي
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-12 px-8 rounded-xl btn-gold border-none font-black"
          >
            {isSaving ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5 ml-2" />}
            حفظ في قاعدة البيانات
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-border shadow-[var(--brand-shadow)] rounded-3xl bg-card">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-lg font-black">الاختبار المستهدف</CardTitle>
              <CardDescription className="font-medium">كل اختبار له برومبت مستقل</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger className="w-full h-12 rounded-xl font-bold">
                  <SelectValue placeholder="اختر اختباراً" />
                </SelectTrigger>
                <SelectContent align="end" dir="rtl">
                  {tests.map((test: { id: number; name: string }) => (
                    <SelectItem key={test.id} value={test.id.toString()} className="font-bold">
                      {test.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-[var(--brand-dark)] to-[#5a3d15] text-white shadow-[var(--brand-shadow)]">
            <Sparkles className="w-8 h-8 text-[#e7bf67] mb-3" />
            <p className="text-sm font-bold leading-relaxed text-[#eadbc5]">
              بعد الحفظ، أي تقرير جديد يُولَّد عبر OpenAI يقرأ البرومبت من هنا. التعديل على
              الكود لم يعد ضرورياً.
            </p>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card className="border border-border shadow-[var(--brand-shadow)] rounded-3xl overflow-hidden bg-card">
            <CardHeader className="bg-gradient-to-br from-[#fffaf3] to-[#f2e4cf] border-b border-border p-6">
              <div className="flex items-center gap-3">
                <Wand2 className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-xl font-black">تعليمات النظام (System)</CardTitle>
                  <CardDescription>الهوية العامة لكاتب التقارير</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[220px] rounded-2xl font-medium text-base leading-relaxed border-border bg-[#fffaf3]"
                placeholder="تعليمات الذكاء الاصطناعي الأساسية..."
              />
            </CardContent>
          </Card>

          <Card className="border border-border shadow-[var(--brand-shadow)] rounded-3xl overflow-hidden bg-card">
            <CardHeader className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-xl font-black">برومبت كل نوع تقرير</CardTitle>
                  <CardDescription>مجاني، شخصية، زواج، قيادة، توظيف، مبيعات، كامل</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-black text-[#674611]">{label}</Label>
                  <Textarea
                    value={typePrompts[key] || ''}
                    onChange={(e) =>
                      setTypePrompts((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="min-h-[120px] rounded-2xl font-medium border-border bg-[#fff8ea] text-sm leading-relaxed"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
