'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { 
  Plus, Search, MoreVertical, Edit, Trash2, Move, 
  ChevronDown, Filter, FileQuestion, Tags
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { QuestionFormModal } from '@/components/admin/question-form-modal'
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog'
import { toast } from 'sonner'

const PATTERN_LABELS: Record<string, string> = {
  ASSERTIVE: 'الحازم', PRECISE: 'المدقق', CALM: 'الهادئ',
  WISE: 'الحكيم', THINKER: 'المفكر', SPONTANEOUS: 'العفوي', OPEN: 'المنفتح',
}

const PATTERN_COLORS: Record<string, string> = {
  ASSERTIVE: 'bg-rose-500/10 text-rose-600',
  PRECISE:   'bg-blue-500/10 text-blue-600',
  CALM:      'bg-emerald-500/10 text-emerald-600',
  WISE:      'bg-amber-500/10 text-amber-600',
  THINKER:   'bg-violet-500/10 text-violet-600',
  SPONTANEOUS:'bg-orange-500/10 text-orange-600',
  OPEN:      'bg-sky-500/10 text-sky-600',
}

interface QuestionOption { id: number; optionText: string; sortOrder: number; scores: { pattern: string; score: number }[] }
interface Question {
  id: number
  questionText: string
  sortOrder: number
  testId: number
  test?: { name: string }
  options: QuestionOption[]
}
interface TestOption { id: number; name: string }

export default function QuestionsPage() {
  const [selectedTest, setSelectedTest] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: testsData } = useSWR<TestOption[]>('/api/admin/tests', fetcher)
  const { data: questionsData, isLoading, mutate } = useSWR<Question[]>(
    `/api/admin/questions${selectedTest !== 'all' ? `?testId=${selectedTest}` : ''}`,
    fetcher
  )

  const tests = testsData || []
  const questions = questionsData || []

  const [modalOpen, setModalOpen] = useState(false)
  const [editQuestion, setEditQuestion] = useState<Question | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/questions/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('تم حذف السؤال بنجاح')
      setDeleteId(null)
      mutate()
    } catch { toast.error('فشل الحذف') }
    finally { setIsDeleting(false) }
  }

  const openAddModal = () => { setEditQuestion(null); setModalOpen(true) }
  const openEditModal = (q: Question) => { setEditQuestion(q); setModalOpen(true) }

  const currentTestId = selectedTest !== 'all' ? parseInt(selectedTest) : (tests[0]?.id ?? 1)

  const filtered = useMemo(() => {
    return questions.filter(q =>
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [questions, searchTerm])

  const patternStats = useMemo(() => {
    const stats: Record<string, number> = {}
    Object.keys(PATTERN_LABELS).forEach(k => {
      stats[k] = questions.reduce((acc, q) => acc + q.options.filter(o => o.scores.some(s => s.pattern === k)).length, 0)
    })
    return stats
  }, [questions])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">إدارة الأسئلة</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {questions.length} سؤال • {tests.length} اختبار
          </p>
        </div>
        <Button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-xl bg-[#ff5722] hover:bg-[#e64a19] text-white shadow-lg shadow-orange-500/20 px-6 h-12 font-black transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 ml-1" />
          إضافة سؤال جديد
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {/* Sidebar Filter */}
        <div className="space-y-3">
          <Card className="border border-border shadow-sm bg-card rounded-2xl overflow-hidden">
            <CardHeader className="px-4 py-3 border-b border-border flex flex-row items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-sm text-foreground">تصفية بالاختبار</span>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {[{ id: 'all', name: 'جميع الأسئلة' }, ...tests].map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTest(t.id.toString())}
                  className={`w-full text-right px-4 py-3 rounded-xl text-sm transition-all font-black ${
                    selectedTest === t.id.toString()
                      ? 'bg-[#15283c] text-white shadow-md shadow-navy-500/20'
                      : 'text-[#64748b] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#1e293b] dark:hover:text-slate-200'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/15 rounded-2xl border border-primary/15">
            <div className="flex items-center gap-2 mb-3">
              <Tags className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">الأنماط</span>
            </div>
            <div className="space-y-1.5">
              {Object.entries(PATTERN_LABELS).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{v}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${PATTERN_COLORS[k]}`}>
                    {patternStats[k] || 0}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="md:col-span-3 space-y-3">
          {/* Search */}
          <div className="flex items-center gap-3 bg-card px-4 py-2.5 rounded-xl border border-border shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث في نص السؤال..."
              className="bg-transparent border-none focus:outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 text-xs">
                ✕
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FileQuestion className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-400">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد أسئلة بعد'}
              </p>
              {!searchTerm && (
                <Button onClick={openAddModal} variant="outline" size="sm" className="mt-4 rounded-xl text-primary border-primary/20 hover:bg-primary/5">
                  <Plus className="w-4 h-4 ml-1" /> أضف أول سؤال
                </Button>
              )}
            </div>
          ) : (
            <Card className="border border-border shadow-sm bg-card rounded-2xl overflow-hidden">
              <div className="divide-y divide-border">
                {filtered.map((q, index) => (
                  <div
                    key={q.id}
                    className="group flex items-start gap-4 px-5 py-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 shrink-0 pt-1">
                      <span className="text-xs font-bold text-slate-300 w-6 text-center">{index + 1}</span>
                      <Move className="w-4 h-4 text-slate-200 group-hover:text-slate-400 transition-colors cursor-move" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        {q.test && (
                          <span className="shrink-0 text-[10px] font-black text-[#ff5722] bg-[#ff5722]/8 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {q.test.name}
                          </span>
                        )}
                      </div>
                      <p className="font-black text-[#1e293b] dark:text-slate-200 leading-snug mb-3 text-base">{q.questionText}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {q.options.map(opt => (
                          <span key={opt.id} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">
                            {opt.optionText.length > 25 ? opt.optionText.slice(0, 25) + '…' : opt.optionText}
                            {opt.scores[0] && (
                              <span className={`mr-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold ${PATTERN_COLORS[opt.scores[0].pattern] ?? 'bg-slate-200 text-slate-600'}`}>
                                {PATTERN_LABELS[opt.scores[0].pattern] ?? opt.scores[0].pattern}
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-[#ff5722] hover:text-white border border-slate-100 dark:border-slate-700 transition-all shadow-sm"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-slate-100 min-w-[140px]">
                        <DropdownMenuItem
                          onClick={() => openEditModal(q)}
                          className="flex items-center gap-2.5 cursor-pointer py-2.5 text-slate-700"
                        >
                          <Edit className="w-4 h-4" /> تعديل
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(q.id)}
                          className="flex items-center gap-2.5 cursor-pointer py-2.5 text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" /> حذف
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <QuestionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={mutate}
        testId={currentTestId}
        editQuestion={editQuestion}
      />

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="حذف السؤال"
        description="سيتم حذف هذا السؤال وجميع إجاباته نهائياً. لا يمكن التراجع عن هذا الإجراء."
      />
    </div>
  )
}
