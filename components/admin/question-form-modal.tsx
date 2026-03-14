'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const PATTERNS = [
  { value: 'ASSERTIVE', label: 'الحازم' },
  { value: 'PRECISE', label: 'المدقق' },
  { value: 'CALM', label: 'الهادئ' },
  { value: 'WISE', label: 'الحكيم' },
  { value: 'THINKER', label: 'المفكر' },
  { value: 'SPONTANEOUS', label: 'العفوي' },
  { value: 'OPEN', label: 'المنفتح' },
]

interface AnswerRow {
  id: string // local key only
  optionText: string
  pattern: string
  sortOrder: number
}

interface QuestionFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  testId: number
  editQuestion?: {
    id: number
    questionText: string
    sortOrder: number
    options: {
      id: number
      optionText: string
      sortOrder: number
      scores: { pattern: string; score: number }[]
    }[]
  } | null
}

function makeDefaultAnswers(): AnswerRow[] {
  return PATTERNS.map((p, i) => ({
    id: crypto.randomUUID(),
    optionText: '',
    pattern: p.value,
    sortOrder: i,
  }))
}

export function QuestionFormModal({ open, onClose, onSuccess, testId, editQuestion }: QuestionFormModalProps) {
  const [questionText, setQuestionText] = useState(editQuestion?.questionText ?? '')
  const [answers, setAnswers] = useState<AnswerRow[]>(() => {
    if (editQuestion?.options?.length) {
      return editQuestion.options.map((opt, i) => ({
        id: crypto.randomUUID(),
        optionText: opt.optionText,
        pattern: opt.scores[0]?.pattern ?? '',
        sortOrder: opt.sortOrder ?? i,
      }))
    }
    return makeDefaultAnswers()
  })
  const [isSaving, setIsSaving] = useState(false)

  // Reset when modal opens/closes
  const handleOpenChange = (val: boolean) => {
    if (!val) {
      onClose()
    }
  }

  const updateAnswer = (id: string, field: keyof AnswerRow, value: string | number) => {
    setAnswers(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  const addAnswer = () => {
    setAnswers(prev => [...prev, {
      id: crypto.randomUUID(),
      optionText: '',
      pattern: '',
      sortOrder: prev.length,
    }])
  }

  const removeAnswer = (id: string) => {
    if (answers.length <= 2) {
      toast.error('يجب أن يكون هناك على الأقل إجابتان')
      return
    }
    setAnswers(prev => prev.filter(a => a.id !== id))
  }

  const validate = (): string | null => {
    if (!questionText.trim()) return 'يرجى إدخال نص السؤال'
    if (answers.some(a => !a.optionText.trim())) return 'يرجى ملء نص جميع الإجابات'
    const usedPatterns = answers.filter(a => a.pattern).map(a => a.pattern)
    const uniquePatterns = new Set(usedPatterns)
    if (uniquePatterns.size !== usedPatterns.length) return 'لا يمكن ربط نمط واحد بأكثر من إجابة'
    return null
  }

  const handleSave = async () => {
    const error = validate()
    if (error) {
      toast.error(error)
      return
    }

    try {
      setIsSaving(true)

      const payload = {
        testId,
        questionText,
        sortOrder: editQuestion?.sortOrder ?? 0,
        options: answers.map((a, i) => ({
          optionText: a.optionText,
          sortOrder: i,
          scores: a.pattern ? [{ pattern: a.pattern, score: 1 }] : [],
        }))
      }

      const url = editQuestion ? `/api/admin/questions/${editQuestion.id}` : '/api/admin/questions'
      const method = editQuestion ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Save failed')

      toast.success(editQuestion ? 'تم تحديث السؤال بنجاح' : 'تم إضافة السؤال بنجاح')
      onSuccess()
      onClose()
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  // Patterns already used (to disable duplicates)
  const usedPatterns = new Set(answers.map(a => a.pattern).filter(Boolean))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border rounded-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
            {editQuestion ? 'تعديل بيانات السؤال' : 'إضافة سؤال جديد للاختبار'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Question Text */}
          <div className="space-y-3">
            <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">نص السؤال</Label>
            <Input
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="اكتب السؤال هنا بوضوح..."
              className="text-right h-14 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold text-lg transition-all"
            />
          </div>

          {/* Answers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">الإجابات المتاحة ({answers.length})</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAnswer}
                className="h-10 px-4 rounded-xl border-dashed border-primary text-primary hover:bg-primary/5 font-bold transition-all"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة إجابة
              </Button>
            </div>

            <div className="grid gap-4">
              {answers.map((answer, index) => (
                <div key={answer.id} className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-secondary/30 rounded-2xl border-2 border-border/5 group transition-all hover:border-primary/20">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-sm font-black text-muted-foreground w-8 h-8 rounded-full bg-background flex items-center justify-center border border-border/50">{index + 1}</span>
                    <Input
                      value={answer.optionText}
                      onChange={e => updateAnswer(answer.id, 'optionText', e.target.value)}
                      placeholder="نص الإجابة..."
                      className="flex-1 text-right h-12 rounded-xl border-2 border-border/5 bg-background text-foreground font-bold focus:border-primary/50"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select
                      value={answer.pattern}
                      onValueChange={val => updateAnswer(answer.id, 'pattern', val)}
                    >
                      <SelectTrigger className="h-12 w-full sm:w-[160px] rounded-xl border-2 border-border/5 bg-background font-bold">
                        <SelectValue placeholder="اختر النمط" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-card">
                        {PATTERNS.map(p => (
                          <SelectItem 
                            key={p.value} 
                            value={p.value}
                            disabled={usedPatterns.has(p.value) && answer.pattern !== p.value}
                            className="font-bold py-2.5"
                          >
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAnswer(answer.id)}
                      className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/10 shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
                كل نمط شخصية لا يمكن ربطه إلا بإجابة واحدة لكل سؤال. النمط الفائز هو الأعلى تصويتاً.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row-reverse gap-4 pt-6">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
          >
            {isSaving ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري الحفظ...</span>
              </div>
            ) : (editQuestion ? 'حفظ التعديلات' : 'إضافة السؤال الآن')}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="w-full sm:w-auto h-14 px-8 rounded-2xl text-muted-foreground font-bold hover:bg-secondary"
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
