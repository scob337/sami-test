import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Book, Check, X, CreditCard, FileText, Upload, FileUp, AlertCircle, Sparkles } from 'lucide-react'
import { buildPricingPlansFromBookPrices } from '@/lib/book-pricing'
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
  const [reportPrice, setReportPrice] = useState(
    String((editBook as { reportPrice?: number })?.reportPrice ?? '')
  )
  const [bookOnlyPrice, setBookOnlyPrice] = useState(
    String((editBook as { bookOnlyPrice?: number })?.bookOnlyPrice ?? '')
  )
  const [isActive, setIsActive] = useState(editBook?.isActive ?? true)
  
  // Landing Page States
  const [heroTitle, setHeroTitle] = useState((editBook as any)?.heroTitle ?? '')
  const [heroSubtitle, setHeroSubtitle] = useState((editBook as any)?.heroSubtitle ?? '')
  const [heroDescription, setHeroDescription] = useState((editBook as any)?.heroDescription ?? '')
  const [heroImage, setHeroImage] = useState((editBook as any)?.heroImage ?? '')
  const [expertName, setExpertName] = useState((editBook as any)?.expertName ?? 'الخبير سامي')
  
  const [features, setFeatures] = useState<any[]>((editBook as any)?.features ?? [])
  const [audience, setAudience] = useState<any[]>((editBook as any)?.audience ?? [])
  const [steps, setSteps] = useState<any[]>((editBook as any)?.steps ?? [])
  const [assistant, setAssistant] = useState<any>((editBook as any)?.assistant ?? { title: '', description: '', examplePos: '', exampleNeg: '', labels: [] })
  const [bookDetails, setBookDetails] = useState<any>((editBook as any)?.bookDetails ?? { image: '', points: [] })
  const [pricingPlans, setPricingPlans] = useState<any[]>((editBook as any)?.pricingPlans ?? [])
  const [ctaTitle, setCtaTitle] = useState((editBook as any)?.ctaTitle ?? '')
  const [ctaDescription, setCtaDescription] = useState((editBook as any)?.ctaDescription ?? '')

  const [isSaving, setIsSaving] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverImageInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const { addUpload, uploads } = useUploadStore()
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const activeUpload = currentUploadId ? uploads[currentUploadId] : null

  useEffect(() => {
    setTitle(editBook?.title ?? '')
    setDescription(editBook?.description ?? '')
    setFilePdf(editBook?.filePdf ?? '')
    setPrice(editBook?.price?.toString() ?? '0')
    setReportPrice(String((editBook as { reportPrice?: number })?.reportPrice ?? ''))
    setBookOnlyPrice(String((editBook as { bookOnlyPrice?: number })?.bookOnlyPrice ?? ''))
    setIsActive(editBook?.isActive ?? true)
    
    setHeroTitle((editBook as any)?.heroTitle ?? '')
    setHeroSubtitle((editBook as any)?.heroSubtitle ?? '')
    setHeroDescription((editBook as any)?.heroDescription ?? '')
    setHeroImage((editBook as any)?.heroImage ?? '')
    setExpertName((editBook as any)?.expertName ?? 'الخبير سامي')
    setFeatures((editBook as any)?.features ?? [])
    setAudience((editBook as any)?.audience ?? [])
    setSteps((editBook as any)?.steps ?? [])
    setAssistant((editBook as any)?.assistant ?? { title: '', description: '', examplePos: '', exampleNeg: '', labels: [] })
    setBookDetails((editBook as any)?.bookDetails ?? { image: '', points: [] })
    setPricingPlans((editBook as any)?.pricingPlans ?? [])
    setCtaTitle((editBook as any)?.ctaTitle ?? '')
    setCtaDescription((editBook as any)?.ctaDescription ?? '')

    setCurrentUploadId(null)
  }, [editBook, open])

  // Sync filePdf when upload completes
  useEffect(() => {
    if (activeUpload?.status === 'completed' && activeUpload.url) {
      setFilePdf(activeUpload.url)
    }
  }, [activeUpload?.status, activeUpload?.url])

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صالح')
      return
    }
    try {
      setIsUploadingCover(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', 'covers')
      const res = await fetch('/api/user/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setHeroImage(data.url)
      toast.success('تم رفع الغلاف بنجاح')
    } catch {
      toast.error('فشل رفع الغلاف')
    } finally {
      setIsUploadingCover(false)
      if (coverImageInputRef.current) coverImageInputRef.current.value = ''
    }
  }

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
      const parsedPrice = parseFloat(price) || 0
      const parsedReport = parseFloat(reportPrice) || 0
      const parsedBookOnly = parseFloat(bookOnlyPrice) || 0
      const syncedPlans = buildPricingPlansFromBookPrices({
        title,
        price: parsedPrice,
        reportPrice: parsedReport,
        bookOnlyPrice: parsedBookOnly,
        hasActiveTest: true,
      })

      const payload = {
        title,
        description,
        filePdf,
        price: parsedPrice,
        reportPrice: parsedReport,
        bookOnlyPrice: parsedBookOnly,
        isActive,
        heroSubtitle,
        heroTitle,
        heroDescription,
        heroImage,
        expertName,
        features,
        audience,
        steps,
        assistant,
        bookDetails,
        pricingPlans: syncedPlans,
        ctaTitle,
        ctaDescription
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
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-none rounded-[32px] p-0 shadow-2xl h-[90vh] flex flex-col overflow-hidden" dir="rtl">
        <div className="bg-[#15283c] p-6 sm:p-8 text-white shrink-0">
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

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Cover Image Upload */}
          <div className="space-y-3">
            <Label className="text-xs font-black text-slate-400 uppercase tracking-[2px] mr-2">غلاف الكتاب (صورة العرض)</Label>
            <input
              type="file"
              ref={coverImageInputRef}
              onChange={handleCoverImageChange}
              accept="image/*"
              className="hidden"
            />
            <div className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700/50">
              {/* Preview */}
              <div className="w-20 h-28 rounded-xl bg-white dark:bg-slate-900 shadow border border-border flex items-center justify-center overflow-hidden shrink-0">
                {heroImage ? (
                  <img src={heroImage} alt="غلاف" className="w-full h-full object-cover" />
                ) : (
                  <Book className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                  {heroImage ? 'تم رفع الغلاف ✓' : 'لم يتم رفع غلاف بعد'}
                </p>
                <p className="text-xs text-slate-400">JPG, PNG, WebP. يُعرض في بطاقة الكتاب بلوحة التحكم والمتجر.</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => coverImageInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-sm font-black text-slate-600 dark:text-slate-300 hover:border-[#ff5722] hover:text-[#ff5722] transition-all disabled:opacity-50"
                  >
                    {isUploadingCover ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span>جاري الرفع...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>{heroImage ? 'تغيير الغلاف' : 'رفع غلاف'}</span>
                      </>
                    )}
                  </button>
                  {heroImage && (
                    <button
                      type="button"
                      onClick={() => setHeroImage('')}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      حذف
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

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

          {/* التسعير والباقات */}
          <div className="rounded-3xl border-2 border-[#e8d9c5] bg-gradient-to-br from-[#fffaf3] to-[#fff8ea] p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-black text-lg text-slate-800">التسعير والباقات</h3>
                <p className="text-sm font-medium text-slate-500">
                  تُطبَّق تلقائياً على الصفحة الرئيسية والدفع
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-black text-[#674611]">الكتاب + التقرير (ر.س)</Label>
                <Input
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="39"
                  className="h-12 rounded-xl font-bold border-[#e8d9c5] bg-white"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-[#674611]">سعر التقرير / الاختبار (ر.س)</Label>
                <Input
                  type="number"
                  min={0}
                  value={reportPrice}
                  onChange={(e) => setReportPrice(e.target.value)}
                  placeholder="اتركه فارغاً للحساب التلقائي"
                  className="h-12 rounded-xl font-bold border-[#e8d9c5] bg-white"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-[#674611]">كتاب الشخصيات السبعة فقط (ر.س)</Label>
                <Input
                  type="number"
                  min={0}
                  value={bookOnlyPrice}
                  onChange={(e) => setBookOnlyPrice(e.target.value)}
                  placeholder="اتركه فارغاً للحساب التلقائي"
                  className="h-12 rounded-xl font-bold border-[#e8d9c5] bg-white"
                  dir="ltr"
                />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 leading-relaxed">
              عند الحفظ تُحدَّث باقات العرض (مجاني، تقرير، كتاب+تقرير، كتاب فقط) وفق هذه الأسعار.
            </p>
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

        <DialogFooter className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 shrink-0 flex flex-col sm:flex-row-reverse gap-4">
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
