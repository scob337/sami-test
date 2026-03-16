'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Save, RefreshCw, MessageSquare, AlertCircle, Info, Brain, Sparkles, Wand2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function PromptsPage() {
  const [selectedTest, setSelectedTest] = useState('1')
  
  const { data: testsData } = useSWR<any[]>('/api/admin/tests', fetcher)
  const { data: promptData, isLoading: isLoadingPrompt, mutate } = useSWR(
    selectedTest ? `/api/admin/prompts?testId=${selectedTest}` : null,
    fetcher
  )

  const tests = testsData || []
  
  const [systemPrompt, setSystemPrompt] = useState('')
  const [reportRules, setReportRules] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [promptId, setPromptId] = useState<number | null>(null)

  useEffect(() => {
    if (promptData) {
      setSystemPrompt(promptData.systemPrompt || '')
      setReportRules(promptData.reportRules || '')
      setPromptId(promptData.id || null)
    } else if (promptData === null) {
      setSystemPrompt('')
      setReportRules('')
      setPromptId(null)
    }
  }, [promptData])

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
          reportRules
        })
      })
      if (!res.ok) throw new Error('Save failed')
      mutate()
      toast.success('تم حفظ إعدادات الذكاء الاصطناعي بنجاح')
    } catch (error) {
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
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[20px] bg-[#15283c] flex items-center justify-center shadow-lg shadow-[#15283c]/20">
            <Brain className="w-8 h-8 text-[#ff5722]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">إدارة البرومبتات (AI)</h2>
            <p className="text-slate-500 font-medium mt-1">التحكم في منطق تحليل الشخصية وتوليد التقارير الذكية</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="h-12 px-6 rounded-xl border-2 border-slate-100 dark:border-slate-800 font-bold hover:bg-slate-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>الوضع الافتراضي</span>
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="h-12 px-8 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white font-black shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            {isSaving ? <LoadingSpinner size="sm" className="text-white" /> : <Save className="w-5 h-5" />}
            <span>حفظ الإعدادات</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 pb-6 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg font-black text-slate-800 dark:text-white">الاختيار المستهدف</CardTitle>
              <CardDescription className="font-medium text-slate-400">حدد الاختبار لتعديل البرومبت الخاص به</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger className="w-full text-right h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 font-bold text-lg">
                  <SelectValue placeholder="اختر اختباراً" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-2xl border-none shadow-2xl bg-white dark:bg-slate-900" dir="rtl">
                  {tests.map((test: any) => (
                    <SelectItem key={test.id} value={test.id.toString()} className="font-bold py-3 px-4">
                      {test.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="p-6 bg-gradient-to-br from-[#15283c] to-[#25394e] rounded-[32px] text-white relative overflow-hidden shadow-xl">
            <Sparkles className="absolute -top-1 -right-1 w-24 h-24 text-white/5 rotate-12" />
            <div className="flex items-center gap-3 mb-4 relative">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Info className="w-5 h-5 text-[#ff5722]" />
              </div>
              <span className="text-sm font-black uppercase tracking-widest">إرشاد تقني</span>
            </div>
            <div className="text-sm text-white/80 space-y-3 font-medium relative leading-relaxed">
              <p>• البرومبت هو "العقل المدبر" الذي يحلل نتائج المستخدم.</p>
              <p>• تأكد من تحديد قواعد واضحة لصيغة التقرير (نبرة الصوت، الأقسام، الطول).</p>
              <p>• التغييرات هنا لا تؤثر على التقارير القديمة، فقط التقارير الجديدة.</p>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden">
            <CardHeader className="bg-[#15283c] p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Wand2 className="w-6 h-6 text-[#ff5722]" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black tracking-tight">منهجية التحليل والتقارير</CardTitle>
                  <CardDescription className="text-white/60 font-medium">صياغة الهوية الذكية والقواعد الصارمة لبرنامج AI</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mr-2">
                  <MessageSquare className="w-4 h-4 text-[#ff5722]" />
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px]">تعليمات السيرفر (System Prompt)</Label>
                </div>
                <Textarea 
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[300px] p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/50 focus:border-[#ff5722]/50 focus:bg-white transition-all text-right leading-relaxed text-slate-700 dark:text-slate-200 font-bold text-lg rounded-3xl resize-none"
                  placeholder="حدد دور الذكاء الاصطناعي.. مثال: أنت خبير في علم النفس التحليلي.."
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mr-2">
                  <Sparkles className="w-4 h-4 text-[#03a9f4]" />
                  <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px]">قواعد تنسيق التقرير النهائي</Label>
                </div>
                <Textarea 
                  value={reportRules}
                  onChange={(e) => setReportRules(e.target.value)}
                  className="min-h-[250px] p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700/50 focus:border-[#03a9f4]/50 focus:bg-white transition-all text-right leading-relaxed text-slate-700 dark:text-slate-200 font-bold text-lg rounded-3xl resize-none"
                  placeholder="حدد الأقسام المطلوب توليدها.. مثال: قسم القوى، قسم التحديات.."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
