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
import { Book, Check, X, CreditCard, Link as LinkIcon, FileText } from 'lucide-react'

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
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-none rounded-[32px] overflow-hidden p-0 shadow-2xl" dir="rtl">
        {/* Header with Background */}
        <div className="bg-[#15283c] p-8 text-white">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Book className="w-6 h-6 text-[#ff5722]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight">
                {editBook ? 'تعديل بيانات الكتاب' : 'إضافة كتاب جديد'}
              </DialogTitle>
              <p className="text-white/60 text-sm font-medium mt-1">
                {editBook ? 'قم بتحديث المعلومات أدناه' : 'املأ البيانات لرفع كتاب جديد للمتجر'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-2.5">
            <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px] mr-2">عنوان الكتاب *</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none group-focus-within:text-[#ff5722] text-slate-300 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="أدخل عنوان الكتاب هنا"
                className="text-right h-14 pr-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 focus:border-[#ff5722]/50 font-bold text-lg transition-all"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px] mr-2">وصف مختصر</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="اكتب وصفاً جذاباً للقراء..."
              className="text-right resize-none rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 focus:border-[#ff5722]/50 font-bold text-lg transition-all p-6"
              rows={3}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px] mr-2">السعر (ر.س)</Label>
              <div className="relative group">
                <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none group-focus-within:text-[#ff5722] text-slate-300 transition-colors">
                  <CreditCard className="w-5 h-5" />
                </div>
                <Input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0.00"
                  min={0}
                  className="text-right h-14 pr-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 focus:border-[#ff5722]/50 font-bold text-lg transition-all"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px] mr-2">حالة الكتاب</Label>
              <div className="flex items-center justify-between h-14 px-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 rounded-2xl transition-all">
                <span className={`text-sm font-black ${isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {isActive ? 'نشط حالياً' : 'معطّل'}
                </span>
                <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-emerald-500" />
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px] mr-2">رابط ملف PDF</Label>
            <div className="relative group">
              <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none group-focus-within:text-[#03a9f4] text-slate-300 transition-colors">
                <LinkIcon className="w-5 h-5" />
              </div>
              <Input
                value={filePdf}
                onChange={e => setFilePdf(e.target.value)}
                placeholder="https://example.com/file.pdf"
                dir="ltr"
                className="h-14 pr-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 focus:border-[#03a9f4]/50 font-bold text-lg transition-all"
              />
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
                <span>{editBook ? 'حفظ التعديلات' : 'إضافة الكتاب'}</span>
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
