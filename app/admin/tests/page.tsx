'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Plus, Search, MoreVertical, Edit, Trash2, ExternalLink,
  ClipboardList, BookOpen, CheckCircle2, XCircle, Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { TestFormModal } from '@/components/admin/test-form-modal'
import { ConfirmDeleteDialog } from '@/components/admin/confirm-delete-dialog'
import { toast } from 'sonner'

interface Test {
  id: number
  name: string
  isActive: boolean
  bookId: number
  book?: { title: string }
  _count: { questions: number }
  createdAt: string
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTest, setEditTest] = useState<Test | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchTests = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/tests')
      if (!res.ok) throw new Error()
      setTests(await res.json())
    } catch { toast.error('خطأ في تحميل الاختبارات') }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => { fetchTests() }, [fetchTests])

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/tests/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('تم حذف الاختبار بنجاح')
      setDeleteId(null)
      fetchTests()
    } catch { toast.error('فشل الحذف') }
    finally { setIsDeleting(false) }
  }

  const openAdd = () => { setEditTest(null); setModalOpen(true) }
  const openEdit = (t: Test) => { setEditTest(t); setModalOpen(true) }

  const filtered = tests.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.book?.title ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">إدارة الاختبارات</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {tests.length} اختبار • {tests.reduce((s, t) => s + (t._count?.questions ?? 0), 0)} سؤال إجمالي
          </p>
        </div>
        <Button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-5 h-11 font-semibold"
        >
          <Plus className="w-4 h-4" />
          إنشاء اختبار
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-card px-4 py-2.5 rounded-xl border border-border shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="ابحث عن اختبار أو كتاب..."
          className="bg-transparent border-none focus:outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <ClipboardList className="w-8 h-8 text-slate-300" />
          </div>
          <p className="font-bold text-slate-400">{searchTerm ? 'لا توجد نتائج' : 'لم يتم إنشاء اختبارات بعد'}</p>
          {!searchTerm && (
            <Button onClick={openAdd} variant="outline" size="sm" className="mt-4 rounded-xl text-primary border-primary/20 hover:bg-primary/5">
              <Plus className="w-4 h-4 ml-1" /> إنشاء أول اختبار
            </Button>
          )}
        </div>
      ) : (
        <Card className="border border-border shadow-sm bg-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">اسم الاختبار</th>
                  <th className="py-3.5 px-5">الكتاب المرتبط</th>
                  <th className="py-3.5 px-5 text-center">عدد الأسئلة</th>
                  <th className="py-3.5 px-5 text-center">الحالة</th>
                  <th className="py-3.5 px-5">تاريخ الإنشاء</th>
                  <th className="py-3.5 px-5 text-left w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((test) => (
                  <tr key={test.id} className="hover:bg-accent/50 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0">
                          <ClipboardList className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-slate-800">{test.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        {test.book?.title ?? <span className="text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {test._count?.questions ?? 0} سؤال
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <Badge
                        variant="secondary"
                        className={`text-xs font-semibold border-0 ${
                          test.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {test.isActive ? (
                          <><CheckCircle2 className="w-3 h-3 ml-1" />نشط</>
                        ) : (
                          <><XCircle className="w-3 h-3 ml-1" />معطل</>
                        )}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-sm text-slate-400">{formatDate(test.createdAt)}</td>
                    <td className="py-4 px-5 text-left">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200"
                          >
                            <MoreVertical className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl shadow-xl border-slate-100 min-w-[150px]">
                          <DropdownMenuItem
                            onClick={() => openEdit(test)}
                            className="flex items-center gap-2.5 cursor-pointer py-2.5 text-slate-700"
                          >
                            <Edit className="w-4 h-4" /> تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <a
                              href={`/test?testId=${test.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2.5 cursor-pointer py-2.5 text-slate-700"
                            >
                              <Eye className="w-4 h-4" /> معاينة
                            </a>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(test.id)}
                            className="flex items-center gap-2.5 cursor-pointer py-2.5 text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" /> حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <TestFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchTests}
        editTest={editTest}
      />

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="حذف الاختبار"
        description="سيتم حذف هذا الاختبار وجميع أسئلته وبرومبتاته المرتبطة به نهائياً."
      />
    </div>
  )
}
