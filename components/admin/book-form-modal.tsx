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
          <DialogTitle className="text-xl font-bold text-foreground">
            {editBook ? 'تعديل الكتاب' : 'إضافة كتاب جديد'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">عنوان الكتاب *</Label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="اسم الكتاب..."
              className="text-right h-11 rounded-xl bg-background border-border/50 focus-visible:ring-primary/50 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">وصف مختصر</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="وصف الكتاب..."
              className="text-right resize-none rounded-xl bg-background border-border/50 focus-visible:ring-primary/50 text-foreground"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">رابط ملف PDF</Label>
            <Input
              value={filePdf}
              onChange={e => setFilePdf(e.target.value)}
              placeholder="https://..."
              dir="ltr"
              className="h-11 rounded-xl bg-background border-border/50 focus-visible:ring-primary/50 text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground">السعر (ريال سعودي)</Label>
            <Input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0"
              min={0}
              className="text-right h-11 rounded-xl bg-background border-border/50 focus-visible:ring-primary/50 text-foreground"
            />
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
            {isSaving ? <LoadingSpinner size="sm" /> : (editBook ? 'حفظ التعديلات' : 'إضافة الكتاب')}
          </Button>
          <Button variant="ghost" onClick={onClose} className="rounded-xl h-11 text-muted-foreground hover:bg-accent hover:text-foreground">
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
