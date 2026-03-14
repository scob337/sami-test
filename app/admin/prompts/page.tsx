'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, MessageSquare, AlertCircle, Info } from 'lucide-react'
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
  const [tests, setTests] = useState<any[]>([])
  const [systemPrompt, setSystemPrompt] = useState('')
  const [reportRules, setReportRules] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [promptId, setPromptId] = useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const testsRes = await fetch('/api/admin/tests')
        const testsData = await testsRes.json()
        setTests(testsData)

        if (selectedTest) {
          const promptRes = await fetch(`/api/admin/prompts?testId=${selectedTest}`)
          const promptData = await promptRes.json()
          if (promptData) {
            setSystemPrompt(promptData.systemPrompt)
            setReportRules(promptData.reportRules)
            setPromptId(promptData.id)
          } else {
            setSystemPrompt('')
            setReportRules('')
            setPromptId(null)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [selectedTest])

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
      toast.success('تم حفظ التعديلات بنجاح')
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">إدارة البرومبتات (AI)</h2>
          <p className="text-muted-foreground">تحكم في هوية الذكاء الاصطناعي وكيفية صياغة التقارير.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>استعادة الافتراضي</span>
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
            {isSaving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
            <span>حفظ التعديلات</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-1 space-y-4">
          <Card className="border border-border/50 shadow-sm h-fit bg-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">إعدادات تقرير الخبراء</CardTitle>
              <CardDescription>حدد الاختبار الذي تريد تعديل قواعد التحليل الخاصة به.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTest} onValueChange={setSelectedTest}>
                <SelectTrigger className="w-full text-right">
                  <SelectValue placeholder="اختر اختباراً" />
                </SelectTrigger>
                <SelectContent align="end">
                  {tests.map((test: any) => (
                    <SelectItem key={test.id} value={test.id.toString()}>
                      {test.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border border-border/50 shadow-sm bg-primary/5 rounded-2xl mt-4">
            <CardContent className="p-4 flex gap-3">
              <Info className="w-5 h-5 text-primary shrink-0" />
              <div className="text-xs text-foreground/80 space-y-2 leading-relaxed">
                <p className="font-bold">نصيحة تقنية:</p>
                <p>البرومبت يتم تخزينه في السيرفر ولا يظهر للمستخدمين نهائياً.</p>
                <p>تعديل البرومبت هنا يؤثر مباشرة على التقارير الجديدة التي يتم توليدها.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="md:col-span-3 border border-border/50 shadow-sm overflow-hidden bg-card rounded-2xl">
          <CardHeader className="border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">منهجية تحليل الخبراء</CardTitle>
                <CardDescription>هذا النص يوجه الخبراء في كيفية تحليل النتائج وصياغة التقرير.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-bold text-foreground">تعليمات التحليل الأساسية</Label>
              <Textarea 
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[250px] bg-background border-border/50 focus:border-primary/50 focus:bg-background transition-all text-right leading-relaxed text-foreground rounded-xl"
                placeholder="اكتب التعليمات الأساسية للخبراء هنا..."
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-bold text-foreground">قواعد صياغة التقرير النهائي</Label>
              <Textarea 
                value={reportRules}
                onChange={(e) => setReportRules(e.target.value)}
                className="min-h-[200px] bg-background border-border/50 focus:border-primary/50 focus:bg-background transition-all text-right leading-relaxed text-foreground rounded-xl"
                placeholder="حدد النقاط التي يجب أن يتضمنها التقرير..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
