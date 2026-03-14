'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface BookFormModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  editBook?: {
    id: number
    title: string
    description?: string | null
    filePdf: string
    price: number
    isActive: boolean
  } | null
}

export function BookFormModal({ open, onClose, onSuccess, editBook }: BookFormModalProps) {
  const [title, setTitle] = useState(editBook?.title ?? '')
  const [description, setDescription] = useState(editBook?.description ?? '')
  const [filePdf, setFilePdf] = useState(editBook?.filePdf ?? '')
  const [price, setPrice] = useState(editBook?.price?.toString() ?? '0')
  const [isActive, setIsActive] = useState(editBook?.isActive ?? true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setTitle(editBook?.title ?? '')
    setDescription(editBook?.description ?? '')
    setFilePdf(editBook?.filePdf ?? '')
    setPrice(editBook?.price?.toString() ?? '0')
    setIsActive(editBook?.isActive ?? true)
  }, [editBook, open])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان الكتاب')
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        title,
        description,
        filePdf,
        price: parseFloat(price) || 0,
        isActive,
      }

      const url = editBook ? `/api/admin/books/${editBook.id}` : '/api/admin/books'
      const method = editBook ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Save failed')

      toast.success(editBook ? 'تم تحديث الكتاب بنجاح' : 'تم إضافة الكتاب بنجاح')
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
      <DialogContent className="max-w-lg bg-card border-border rounded-3xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
            {editBook ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد للمتجر'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">عنوان الكتاب *</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: دليل فهم الشخصية القيادية"
              className="text-right h-14 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold text-lg transition-all"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">وصف مختصر</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="اكتب وصفاً جذاباً للكتاب..."
              className="text-right resize-none rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold text-lg transition-all p-6"
              rows={4}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">السعر (ر.س)</Label>
              <Input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0"
                min={0}
                className="text-right h-14 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold text-lg transition-all"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">حالة الكتاب</Label>
              <div className="flex items-center justify-between h-14 px-6 bg-secondary/50 border-2 border-border/5 rounded-2xl transition-all">
                <span className="text-sm font-bold text-muted-foreground">{isActive ? 'نشط حالياً' : 'معطل مؤقتاً'}</span>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">رابط ملف PDF</Label>
            <Input
              value={filePdf}
              onChange={e => setFilePdf(e.target.value)}
              placeholder="https://storage.com/book.pdf"
              dir="ltr"
              className="h-14 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold text-lg transition-all"
            />
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
            ) : (editBook ? 'حفظ التعديلات' : 'إضافة الكتاب الآن')}
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
