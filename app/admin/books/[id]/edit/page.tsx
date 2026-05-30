'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ArrowRight, Save, Tag, Plus, Trash2, Percent, DollarSign, X } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FileUploadField } from '@/components/admin/file-upload-field'

interface DiscountCode {
  id: number
  code: string
  discount: number
  type: string
  isActive: boolean
  expiresAt: string | null
}

interface Book {
  id: number
  title: string
  description?: string | null
  filePdf: string
  price: number
  reportPrice?: number
  bookOnlyPrice?: number
  heroImage?: string | null
  isActive: boolean
  expertName?: string | null
  discountCodes?: DiscountCode[]
}

export default function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: book, isLoading, mutate } = useSWR<Book>(`/api/admin/books/${id}`, fetcher)

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    reportPrice: '',
    bookOnlyPrice: '',
    heroImage: '',
    isActive: true,
    expertName: '',
  })

  // Discount code state
  const [newCode, setNewCode] = useState('')
  const [newDiscount, setNewDiscount] = useState('')
  const [newType, setNewType] = useState<'PERCENT' | 'FIXED'>('PERCENT')
  const [newExpiresAt, setNewExpiresAt] = useState('')
  const [addingCode, setAddingCode] = useState(false)

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        description: book.description || '',
        price: book.price?.toString() || '0',
        reportPrice: book.reportPrice?.toString() || '0',
        bookOnlyPrice: book.bookOnlyPrice?.toString() || '0',
        heroImage: book.heroImage || '',
        isActive: book.isActive ?? true,
        expertName: book.expertName || '',
      })
    }
  }, [book])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/books/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price) || 0,
          reportPrice: parseFloat(formData.reportPrice) || 0,
          bookOnlyPrice: parseFloat(formData.bookOnlyPrice) || 0,
        }),
      })

      if (!res.ok) throw new Error('Failed to update')
      toast.success('تم تحديث الكتاب بنجاح')
      router.push('/admin/books')
      router.refresh()
    } catch (error) {
      toast.error('حدث خطأ أثناء التحديث')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDiscount = async () => {
    if (!newCode.trim() || !newDiscount.trim()) {
      toast.error('يرجى ملء كود الخصم والقيمة')
      return
    }
    setAddingCode(true)
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode.trim().toUpperCase(),
          discount: parseFloat(newDiscount),
          type: newType,
          bookId: parseInt(id),
          expiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
        }),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }
      toast.success('تم إضافة كود الخصم بنجاح')
      setNewCode('')
      setNewDiscount('')
      setNewExpiresAt('')
      setNewType('PERCENT')
      mutate()
    } catch (err: any) {
      toast.error(err.message || 'فشل إضافة الكود')
    } finally {
      setAddingCode(false)
    }
  }

  const handleDeleteDiscount = async (discountId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكود؟')) return
    try {
      const res = await fetch(`/api/admin/discounts/${discountId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('تم حذف كود الخصم')
      mutate()
    } catch {
      toast.error('فشل الحذف')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/books" className="inline-flex">
          <ArrowRight className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">تعديل الكتاب</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{book?.title}</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-bold">
              عنوان الكتاب
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="أدخل عنوان الكتاب"
              className="mt-2 rounded-lg"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-bold">
              الوصف
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="أدخل وصف الكتاب"
              className="mt-2 rounded-lg"
              rows={4}
            />
          </div>

          {/* Expert Name */}
          <div>
            <Label htmlFor="expertName" className="text-sm font-bold">
              اسم المؤلف
            </Label>
            <Input
              id="expertName"
              value={formData.expertName}
              onChange={(e) => setFormData({ ...formData, expertName: e.target.value })}
              placeholder="اسم المؤلف"
              className="mt-2 rounded-lg"
            />
          </div>

          {/* Pricing */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price" className="text-sm font-bold">
                سعر الكتاب + التقرير
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
                className="mt-2 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="reportPrice" className="text-sm font-bold">
                سعر التقرير فقط
              </Label>
              <Input
                id="reportPrice"
                type="number"
                value={formData.reportPrice}
                onChange={(e) => setFormData({ ...formData, reportPrice: e.target.value })}
                placeholder="0"
                className="mt-2 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="bookOnlyPrice" className="text-sm font-bold">
                سعر الكتاب فقط
              </Label>
              <Input
                id="bookOnlyPrice"
                type="number"
                value={formData.bookOnlyPrice}
                onChange={(e) => setFormData({ ...formData, bookOnlyPrice: e.target.value })}
                placeholder="0"
                className="mt-2 rounded-lg"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div>
            <Label className="text-sm font-bold">صورة الغلاف</Label>
            <FileUploadField
              value={formData.heroImage}
              onChange={(url) => setFormData({ ...formData, heroImage: url })}
              accept="image/*"
              label="رفع صورة الغلاف"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-border">
            <Label htmlFor="isActive" className="text-sm font-bold cursor-pointer">
              تفعيل الكتاب
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(val) => setFormData({ ...formData, isActive: val })}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-11 font-bold"
          >
            <Save className="w-4 h-4 ml-2" />
            {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </form>

      {/* Discount Codes Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-border p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">أكواد الخصم</h3>
          <span className="text-sm text-muted-foreground">
            {book?.discountCodes?.length || 0} كود
          </span>
        </div>

        {/* Add New Code */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-border p-4 space-y-4">
          <h4 className="font-bold text-sm">إضافة كود خصم جديد</h4>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newCode" className="text-sm font-bold">
                الكود
              </Label>
              <Input
                id="newCode"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="مثال: SAVE20"
                className="mt-2 rounded-lg uppercase"
              />
            </div>

            <div>
              <Label htmlFor="newDiscount" className="text-sm font-bold">
                قيمة الخصم
              </Label>
              <Input
                id="newDiscount"
                type="number"
                value={newDiscount}
                onChange={(e) => setNewDiscount(e.target.value)}
                placeholder="0"
                className="mt-2 rounded-lg"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="newType" className="text-sm font-bold">
                نوع الخصم
              </Label>
              <select
                id="newType"
                value={newType}
                onChange={(e) => setNewType(e.target.value as 'PERCENT' | 'FIXED')}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-foreground font-medium"
              >
                <option value="PERCENT">نسبة مئوية %</option>
                <option value="FIXED">مبلغ ثابت ر.س</option>
              </select>
            </div>

            <div>
              <Label htmlFor="newExpiresAt" className="text-sm font-bold">
                تاريخ انتهاء الصلاحية (اختياري)
              </Label>
              <Input
                id="newExpiresAt"
                type="datetime-local"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
                className="mt-2 rounded-lg"
              />
            </div>
          </div>

          <Button
            onClick={handleAddDiscount}
            disabled={addingCode}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg h-10 font-bold"
          >
            <Plus className="w-4 h-4 ml-2" />
            {addingCode ? 'جاري الإضافة...' : 'إضافة الكود'}
          </Button>
        </div>

        {/* Existing Codes */}
        {book?.discountCodes && book.discountCodes.length > 0 ? (
          <div className="space-y-3">
            {book.discountCodes.map((dc) => (
              <div
                key={dc.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-border"
              >
                <div className="flex-1">
                  <div className="font-bold text-foreground">{dc.code}</div>
                  <div className="text-sm text-muted-foreground">
                    {dc.type === 'PERCENT' ? `${dc.discount}%` : `${dc.discount} ر.س`} •{' '}
                    {dc.isActive ? (
                      <span className="text-green-600 font-semibold">مفعل</span>
                    ) : (
                      <span className="text-red-600 font-semibold">معطل</span>
                    )}
                    {dc.expiresAt && (
                      <>
                        {' '}
                        • ينتهي: {new Date(dc.expiresAt).toLocaleDateString('ar')}
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteDiscount(dc.id)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد أكواد خصم بعد
          </div>
        )}
      </div>
    </div>
  )
}
