'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ClipboardList, BookOpen, Check, X } from 'lucide-react'

interface Book { id: number; title: string }

interface TestFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editTest?: {
    id: number
    name: string
    bookId: number
    isActive: boolean
    seoTitle?: string | null
    seoDescription?: string | null
    seoKeywords?: string | null
  } | null
}

export function TestFormModal({ open, onClose, onSuccess, editTest }: TestFormModalProps) {
  const [name, setName] = useState(editTest?.name ?? '')
  const [bookId, setBookId] = useState(editTest?.bookId?.toString() ?? '')
  const [isActive, setIsActive] = useState(editTest?.isActive ?? true)
  const [seoTitle, setSeoTitle] = useState(editTest?.seoTitle ?? '')
  const [seoDescription, setSeoDescription] = useState(editTest?.seoDescription ?? '')
  const [seoKeywords, setSeoKeywords] = useState(editTest?.seoKeywords ?? '')
  const [books, setBooks] = useState<Book[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setName(editTest?.name ?? '')
    setBookId(editTest?.bookId?.toString() ?? '')
    setIsActive(editTest?.isActive ?? true)
    setSeoTitle(editTest?.seoTitle ?? '')
    setSeoDescription(editTest?.seoDescription ?? '')
    setSeoKeywords(editTest?.seoKeywords ?? '')
  }, [editTest, open])

  useEffect(() => {
    fetch('/api/admin/books')
      .then(r => r.json())
      .then(setBooks)
      .catch(console.error)
  }, [])

  const handleSave = async () => {
    if (!name.trim()) { toast.error('يرجى إدخال اسم الاختبار'); return }
    if (!bookId) { toast.error('يرجى اختيار الكتاب المرتبط'); return }

    try {
      setIsSaving(true)
      const payload = { name, bookId, isActive, seoTitle, seoDescription, seoKeywords }

      const url = editTest ? `/api/admin/tests/${editTest.id}` : '/api/admin/tests'
      const method = editTest ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Save failed')

      toast.success(editTest ? 'تم تحديث الاختبار بنجاح' : 'تم إنشاء الاختبار بنجاح')
      onSuccess()
      onClose()
    } catch {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={val => !val && onClose()}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-none rounded-[32px] overflow-hidden p-0 shadow-2xl" dir="rtl">
        {/* Header with Background */}
        <div className="bg-[#15283c] p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <ClipboardList className="w-6 h-6 text-[#ff5722]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {editTest ? 'تعديل بيانات الاختبار' : 'إنشاء اختبار جديد'}
              </DialogTitle>
              <p className="text-white/60 text-sm font-medium mt-1">
                {editTest ? 'قم بتحديث المعلومات أدناه' : 'املأ البيانات لإنشاء اختبار جديد مرتبط بكتاب'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2.5">
            <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px] mr-2">اسم الاختبار *</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none group-focus-within:text-[#ff5722] text-slate-300 transition-colors">
                <ClipboardList className="w-5 h-5" />
              </div>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="أدخل اسم الاختبار هنا"
                className="text-right h-14 pr-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 focus:border-[#ff5722]/50 font-bold text-lg transition-all"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label className="text-xs font-black uppercase tracking-[2px] mr-2">الكتاب المرتبط *</Label>
              <Select value={bookId} onValueChange={setBookId}>
                <SelectTrigger className="h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 focus:border-[#ff5722]/50 font-bold text-lg transition-all">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5" />
                    <SelectValue placeholder="اختر كتاباً..." />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-white dark:bg-slate-900 shadow-xl" dir="rtl">
                  {books.map(b => (
                    <SelectItem key={b.id} value={b.id.toString()} className="font-bold py-3 px-4 focus:bg-slate-50 focus:text-white dark:focus:bg-slate-800 cursor-pointer">
                      {b.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs  text-slate-400 uppercase tracking-[2px] mr-2">حالة الاختبار</Label>
              <div className="flex items-center justify-between h-14 px-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl transition-all">
                <span className={`text-sm  text-white`}>
                  {isActive ? 'نشط حالياً' : 'معطّل'}
                </span>
                <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-emerald-500 text-white" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-0 flex flex-col sm:flex-row-reverse gap-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-[#ff5722] hover:bg-[#e64a19] text-white font-black text-lg shadow-xl shadow-orange-500/20 transition-all active:scale-95"
          >
            {isSaving ? (
              <div className="flex items-center gap-3">
                <LoadingSpinner size="sm" className="text-white" />
                <span>جاري الحفظ...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span>{editTest ? 'حفظ التعديلات' : 'إنشاء الاختبار'}</span>
              </div>
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto h-14 px-8 rounded-2xl text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5 ml-2" />
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
