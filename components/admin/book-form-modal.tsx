import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Book, Check, X, CreditCard, Link as LinkIcon, FileText, Upload, FileUp, AlertCircle } from 'lucide-react'
import { useUploadStore } from '@/lib/store/upload-store'
import { Progress } from '@/components/ui/progress'

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
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addUpload, uploads } = useUploadStore()
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const activeUpload = currentUploadId ? uploads[currentUploadId] : null

  useEffect(() => {
    setTitle(editBook?.title ?? '')
    setDescription(editBook?.description ?? '')
    setFilePdf(editBook?.filePdf ?? '')
    setPrice(editBook?.price?.toString() ?? '0')
    setIsActive(editBook?.isActive ?? true)
    setCurrentUploadId(null)
  }, [editBook, open])

  // Sync filePdf when upload completes
  useEffect(() => {
    if (activeUpload?.status === 'completed' && activeUpload.url) {
      setFilePdf(activeUpload.url)
    }
  }, [activeUpload?.status, activeUpload?.url])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      toast.error('يرجى اختيار ملف PDF فقط')
      return
    }

    try {
      const id = await addUpload(file, 'books')
      setCurrentUploadId(id)
    } catch (err) {
      console.error('File selection error:', err)
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان الكتاب')
      return
    }
    
    if (!filePdf) {
      toast.error('يرجى رفع ملف الكتاب أولاً')
      return
    }

    if (activeUpload && activeUpload.status === 'uploading') {
      toast.error('يرجى الانتظار حتى ينتهي رفع الملف')
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
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-none rounded-[32px] p-0 shadow-2xl overflow-y-auto max-h-[95vh] scrollbar-hide" dir="rtl">
        <div className="bg-[#15283c] p-8 text-white sticky top-0 z-50">
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

          <div className="space-y-4">
            <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px] mr-2">ملف الكتاب (PDF) *</Label>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf" 
              className="hidden" 
            />

            {!activeUpload && !filePdf && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center hover:border-[#ff5722]/50 hover:bg-[#ff5722]/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-[#ff5722] group-hover:bg-white dark:group-hover:bg-slate-900 transition-all mb-3 shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="text-sm font-black text-slate-500 group-hover:text-[#ff5722]">اضغط لرفع ملف PDF</span>
              </button>
            )}

            {activeUpload && activeUpload.status === 'uploading' && (
              <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-500/5 border-2 border-blue-100 dark:border-blue-500/20 space-y-4">
                <div className="flex justify-between items-center text-sm font-black text-blue-600 dark:text-blue-400">
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>جاري الرفع...</span>
                  </div>
                  <span>{activeUpload.progress}%</span>
                </div>
                <Progress value={activeUpload.progress} className="h-2 [&>div]:bg-blue-500" />
                <p className="text-xs font-bold text-blue-500/60 truncate">{activeUpload.fileName}</p>
              </div>
            )}

            {(filePdf || (activeUpload && activeUpload.status === 'completed')) && (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border-2 border-emerald-100 dark:border-emerald-500/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">تم تجهيز الملف</span>
                    <p className="text-[10px] font-bold text-emerald-500/60 truncate max-w-[200px]">
                      {activeUpload?.fileName || 'PDF Document'}
                    </p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-slate-400 hover:text-destructive"
                  onClick={() => { setFilePdf(''); setCurrentUploadId(null); }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {activeUpload && activeUpload.status === 'error' && (
              <div className="p-4 rounded-2xl bg-destructive/5 border-2 border-destructive/20 flex items-center justify-between">
                <div className="flex items-center gap-3 text-destructive">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-bold">فشل رفع الملف، حاول مرة أخرى</span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-destructive hover:bg-destructive/10"
                >
                  إعادة المحاولة
                </Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 sticky bottom-0 z-50 flex flex-col sm:flex-row-reverse gap-4">
          <Button
            onClick={handleSave}
            disabled={!!isSaving || !!(activeUpload && activeUpload.status === 'uploading')}
            className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-[#ff5722] hover:bg-[#e64a19] text-white font-black text-lg shadow-xl shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
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
