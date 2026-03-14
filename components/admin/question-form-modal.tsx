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
          <DialogTitle className="text-xl font-bold text-foreground">
            {editQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question Text */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">نص السؤال</Label>
            <Input
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              placeholder="اكتب السؤال هنا..."
              className="text-right h-12 rounded-xl bg-background border-border/50 focus-visible:ring-primary/50 text-foreground"
            />
          </div>

          {/* Answers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-foreground">الإجابات ({answers.length})</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAnswer}
                className="h-8 px-3 text-xs rounded-lg border-dashed border-primary text-primary hover:bg-primary/5"
              >
                <Plus className="w-3 h-3 ml-1" />
                إضافة إجابة
              </Button>
            </div>

            <div className="space-y-2">
              {answers.map((answer, index) => (
                <div key={answer.id} className="flex items-center gap-2 p-3 bg-muted/50 rounded-xl border border-border/50">
                  <span className="text-xs font-bold text-muted-foreground w-5 text-center">{index + 1}</span>
                  
                  <Input
                    value={answer.optionText}
                    onChange={e => updateAnswer(answer.id, 'optionText', e.target.value)}
                    placeholder="نص الإجابة..."
                    className="flex-1 text-right h-9 rounded-lg border-border/50 bg-background text-foreground text-sm focus-visible:ring-primary/50"
                  />

                  <Select
                    value={answer.pattern}
                    onValueChange={val => updateAnswer(answer.id, 'pattern', val)}
                  >
                    <SelectTrigger className="w-36 h-9 text-xs rounded-lg border-border/50 bg-background text-foreground text-right focus-visible:ring-primary/50">
                      <SelectValue placeholder="النمط..." />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {PATTERNS.map(p => (
                        <SelectItem
                          key={p.value}
                          value={p.value}
                          disabled={usedPatterns.has(p.value) && answer.pattern !== p.value}
                          className="text-right text-sm"
                        >
                          {p.label}
                          {usedPatterns.has(p.value) && answer.pattern !== p.value && (
                            <span className="text-muted-foreground/70 text-xs mr-1">(مستخدم)</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAnswer(answer.id)}
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
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

        <DialogFooter className="flex flex-row-reverse gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-11 font-bold"
          >
            {isSaving ? <LoadingSpinner size="sm" /> : (editQuestion ? 'حفظ التعديلات' : 'إضافة السؤال')}
          </Button>
          <Button variant="ghost" onClick={onClose} className="rounded-xl h-11 text-muted-foreground hover:bg-accent hover:text-foreground">
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
