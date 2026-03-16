'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, AlertCircle, FileQuestion, Check, X, Tags } from 'lucide-react'
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

  const usedPatterns = new Set(answers.map(a => a.pattern).filter(Boolean))

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl bg-white dark:bg-slate-900 border-none rounded-[32px] overflow-hidden p-0 shadow-2xl h-[90vh] flex flex-col" dir="rtl">
        {/* Header with Background */}
        <div className="bg-[#15283c] p-8 text-white shrink-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <FileQuestion className="w-6 h-6 text-[#ff5722]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {editQuestion ? 'تعديل بيانات السؤال' : 'إضافة سؤال جديد'}
              </DialogTitle>
              <p className="text-white/60 text-sm font-medium mt-1">
                {editQuestion ? 'قم بتحديث نص السؤال والإجابات' : 'أدخل نص السؤال وحدد الأنماط المرتبطة بالإجابات'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* Question Text */}
          <div className="space-y-4">
            <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px] mr-2">نص السؤال الاستقصائي</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none group-focus-within:text-[#ff5722] text-slate-300 transition-colors">
                <FileQuestion className="w-6 h-6" />
              </div>
              <Input
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                placeholder="مثال: كيف تتصرف عندما يواجهك موقف غير متوقع؟"
                className="text-right h-16 pr-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 focus:border-[#ff5722]/50 font-bold text-xl transition-all"
              />
            </div>
          </div>

          {/* Answers Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tags className="w-5 h-5 text-slate-400" />
                <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px]">الإجابات المتاحة والأنماط المعيارية</Label>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAnswer}
                className="h-10 px-6 rounded-xl border-2 border-dashed border-[#03a9f4] text-[#03a9f4] hover:bg-[#03a9f4]/5 font-black transition-all"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة خيار إجابة
              </Button>
            </div>

            <div className="grid gap-5">
              {answers.map((answer, index) => (
                <div key={answer.id} className="flex flex-col gap-4 p-5 md:p-6 bg-slate-50/50 dark:bg-slate-800/40 rounded-[32px] border-2 border-slate-100 dark:border-slate-700/30 group transition-all hover:border-[#ff5722]/30 shadow-sm">
                  {/* Top Part: Number + Input */}
                  <div className="flex items-center gap-4 w-full">
                    <span className="text-lg font-black text-white w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-white dark:border-slate-600 shadow-sm group-hover:bg-[#ff5722] transition-all shrink-0">
                      {index + 1}
                    </span>
                    <Input
                      value={answer.optionText}
                      onChange={e => updateAnswer(answer.id, 'optionText', e.target.value)}
                      placeholder="أدخل نص خيار الإجابة هنا بوضوح..."
                      className="flex-1 text-right h-16 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold text-lg focus:border-[#ff5722]/50 shadow-sm transition-all"
                    />
                  </div>
                  
                  {/* Bottom Part: Select + Delete */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Tags className="w-5 h-5" />
                      </div>
                      <Select
                        value={answer.pattern}
                        onValueChange={val => updateAnswer(answer.id, 'pattern', val)}
                      >
                        <SelectTrigger className="h-14 flex-1 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-slate-700 dark:text-slate-300 shadow-sm">
                          <SelectValue placeholder="اربط هذه الإجابة بنمط محدد" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none bg-white dark:bg-slate-900 shadow-2xl" dir="rtl">
                          {PATTERNS.map(p => (
                            <SelectItem 
                              key={p.value} 
                              value={p.value}
                              disabled={usedPatterns.has(p.value) && answer.pattern !== p.value}
                              className="font-black py-3 px-4 focus:bg-slate-50 dark:focus:bg-slate-800 cursor-pointer"
                            >
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeAnswer(answer.id)}
                      className="h-14 px-6 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 border-2 border-transparent hover:border-red-100 dark:hover:border-red-500/20 font-bold transition-all"
                    >
                      <Trash2 className="w-5 h-5 ml-2" />
                      حذف الإجابة
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-4 p-5 bg-[#ffc107]/5 rounded-[24px] border-2 border-[#ffc107]/10">
              <div className="w-10 h-10 rounded-xl bg-[#ffc107]/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6 text-[#ffc107]" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-bold leading-relaxed">
                تنبيه: كل نمط شخصية يجب أن يرتبط بإجابة واحدة فقط كحد أقصى في السؤال الواحد لضمان دقة التحليل السيكومتري للنتائج.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 shrink-0 flex flex-col sm:flex-row-reverse gap-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto h-16 px-12 rounded-2xl bg-[#ff5722] hover:bg-[#e64a19] text-white font-black text-xl shadow-xl shadow-orange-500/20 transition-all active:scale-95"
          >
            {isSaving ? (
              <div className="flex items-center gap-3">
                <LoadingSpinner size="sm" className="text-white" />
                <span>جاري حفظ البيانات...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="w-6 h-6" />
                <span>{editQuestion ? 'حفظ التعديلات' : 'إضافة السؤال الآن'}</span>
              </div>
            )}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="w-full sm:w-auto h-16 px-10 rounded-2xl text-slate-400 font-black text-lg hover:bg-white dark:hover:bg-slate-900 shadow-sm border-2 border-slate-100 dark:border-slate-700/50"
          >
            <X className="w-6 h-6 ml-2" />
            إلغاء وإغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
