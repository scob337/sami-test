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
      <DialogContent className="max-w-md bg-card border-border rounded-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {editTest ? 'تعديل الاختبار' : 'إنشاء اختبار جديد'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">اسم الاختبار *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="مثال: اختبار الأنماط السبعة"
              className="text-right h-11 rounded-xl bg-background border-border/50 focus-visible:ring-primary/50 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">الكتاب المرتبط *</Label>
            <Select value={bookId} onValueChange={setBookId}>
              <SelectTrigger className="h-11 rounded-xl text-right bg-background border-border/50 focus-visible:ring-primary/50 text-foreground">
                <SelectValue placeholder="اختر كتاباً..." />
              </SelectTrigger>
              <SelectContent align="end">
                {books.map(b => (
                  <SelectItem key={b.id} value={b.id.toString()} className="text-right">
                    {b.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 border border-border/50 rounded-xl">
            <Label className="text-sm font-bold text-foreground">نشط</Label>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>

        <DialogFooter className="flex flex-row-reverse gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-11 font-bold"
          >
            {isSaving ? <LoadingSpinner size="sm" /> : (editTest ? 'حفظ التعديلات' : 'إنشاء الاختبار')}
          </Button>
          <Button variant="ghost" onClick={onClose} className="rounded-xl h-11 text-muted-foreground hover:bg-accent hover:text-foreground">
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
