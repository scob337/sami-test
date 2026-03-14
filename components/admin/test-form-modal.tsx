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
  } | null
}

export function TestFormModal({ open, onClose, onSuccess, editTest }: TestFormModalProps) {
  const [name, setName] = useState(editTest?.name ?? '')
  const [bookId, setBookId] = useState(editTest?.bookId?.toString() ?? '')
  const [isActive, setIsActive] = useState(editTest?.isActive ?? true)
  const [books, setBooks] = useState<Book[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setName(editTest?.name ?? '')
    setBookId(editTest?.bookId?.toString() ?? '')
    setIsActive(editTest?.isActive ?? true)
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
      const payload = { name, bookId, isActive }

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
      <DialogContent className="max-w-2xl bg-card border-border rounded-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
            {editTest ? 'تعديل بيانات الاختبار' : 'إنشاء اختبار جديد'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">اسم الاختبار *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: اختبار الأنماط السبعة"
              className="text-right h-14 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold text-lg transition-all"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">الكتاب المرتبط *</Label>
              <Select value={bookId} onValueChange={setBookId}>
                <SelectTrigger className="h-14 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold text-lg transition-all">
                  <SelectValue placeholder="اختر كتاباً..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border bg-card">
                  {books.map(b => (
                    <SelectItem key={b.id} value={b.id.toString()} className="font-bold py-3 px-4">
                      {b.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">حالة الاختبار</Label>
              <div className="flex items-center justify-between h-14 px-6 bg-secondary/50 border-2 border-border/5 rounded-2xl transition-all">
                <span className="text-sm font-bold text-muted-foreground">{isActive ? 'نشط حالياً' : 'معطل مؤقتاً'}</span>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row-reverse gap-4 pt-4">
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
            ) : (editTest ? 'حفظ التعديلات' : 'إنشاء الاختبار الآن')}
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
