'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Plus, Trash2, Search, Tag, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface DiscountCode {
  id: number
  code: string
  discount: number
  type: string
  isActive: boolean
  expiresAt: string | null
  courseId: number | null
  bookId: number | null
  testId: number | null
  createdAt: string
}

export default function AdminDiscountsPage() {
  const { data: codes, isLoading, mutate } = useSWR<DiscountCode[]>('/api/admin/discounts', fetcher)
  
  // Also fetch list of books, tests, courses to bind
  const { data: courses } = useSWR<any[]>('/api/admin/courses', fetcher)
  const { data: books } = useSWR<any[]>('/api/admin/books', fetcher)
  const { data: tests } = useSWR<any[]>('/api/admin/tests', fetcher)

  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'PERCENT',
    expiresAt: '',
    courseId: '',
    bookId: '',
    testId: '',
    isActive: true
  })

  const filteredCodes = useMemo(() => {
    if (!codes) return []
    return codes.filter(c => 
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [codes, searchTerm])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.discount) {
      toast.error('يرجى ملء كود الخصم والقيمة')
      return
    }

    setLoading(true)
    try {
      const payload: any = {
        code: formData.code.toUpperCase(),
        discount: parseFloat(formData.discount),
        type: formData.type,
        isActive: formData.isActive,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null
      }
      
      if (formData.courseId) payload.courseId = parseInt(formData.courseId)
      if (formData.bookId) payload.bookId = parseInt(formData.bookId)
      if (formData.testId) payload.testId = parseInt(formData.testId)

      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) throw new Error(await res.text())
      toast.success('تم إضافة الكود بنجاح')
      mutate()
      // reset form
      setFormData({
        code: '',
        discount: '',
        type: 'PERCENT',
        expiresAt: '',
        courseId: '',
        bookId: '',
        testId: '',
        isActive: true
      })
    } catch (err: any) {
      toast.error(err.message || 'فشل إضافة الكود')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكود؟')) return
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('تم الحذف')
      mutate()
    } catch {
      toast.error('فشل الإجراء')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">إدارة أكواد الخصم</h2>
          <p className="text-sm text-slate-500 mt-0.5">إضافة ومتابعة كوبونات الخصم</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <Card className="lg:col-span-1 p-6 space-y-6 border border-border shadow-sm bg-card rounded-2xl h-fit">
          <h3 className="text-lg font-bold">كود خصم جديد</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-bold">الكود</Label>
              <Input
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="SAVE20"
                className="mt-2 uppercase"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-bold">قيمة الخصم</Label>
                <Input
                  type="number"
                  value={formData.discount}
                  onChange={e => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="0"
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-sm font-bold">نوع الخصم</Label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 focus:outline-none"
                >
                  <option value="PERCENT">نسبة %</option>
                  <option value="FIXED">مبلغ ثابت</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-bold">تاريخ الانتهاء (اختياري)</Label>
              <Input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                className="mt-2"
              />
            </div>

            <div className="pt-2 border-t border-border">
              <Label className="text-sm font-bold text-primary mb-2 block">ربط بمنتج محدد (اختياري)</Label>
              
              <div className="space-y-3">
                <select
                  value={formData.courseId}
                  onChange={e => setFormData({ ...formData, courseId: e.target.value, bookId: '', testId: '' })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:outline-none"
                >
                  <option value="">-- كورس محدد --</option>
                  {courses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>

                <select
                  value={formData.bookId}
                  onChange={e => setFormData({ ...formData, bookId: e.target.value, courseId: '', testId: '' })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:outline-none"
                >
                  <option value="">-- كتاب محدد --</option>
                  {books?.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>

                <select
                  value={formData.testId}
                  onChange={e => setFormData({ ...formData, testId: e.target.value, courseId: '', bookId: '' })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-white dark:bg-slate-900 text-sm focus:outline-none"
                >
                  <option value="">-- اختبار محدد --</option>
                  {tests?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <p className="text-xs text-muted-foreground mt-2">اتركه فارغاً ليكون كود عام على كل شيء.</p>
            </div>

            <Button disabled={loading} type="submit" className="w-full bg-[#ff5722] hover:bg-[#e64a19] text-white">
              {loading ? 'جاري الإضافة...' : 'إضافة الكود'}
            </Button>
          </form>
        </Card>

        {/* List Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 bg-card px-4 py-2.5 rounded-xl border border-border shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث عن كود..."
              className="bg-transparent border-none focus:outline-none w-full"
            />
          </div>

          {isLoading ? (
            <div className="py-12 flex justify-center"><LoadingSpinner size="lg" /></div>
          ) : filteredCodes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
              لا توجد أكواد خصم متاحة
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCodes.map(code => (
                <div key={code.id} className="bg-card p-4 rounded-xl border border-border shadow-sm flex items-center justify-between transition-colors hover:bg-accent/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{code.code}</span>
                      <Badge variant="secondary" className={code.isActive ? 'bg-emerald-100/50 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                        {code.isActive ? 'مفعل' : 'معطل'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-4">
                      <span>النوع: {code.type === 'PERCENT' ? 'نسبة %' : 'ثابت'}</span>
                      <span>الخصم: {code.discount}</span>
                      {code.courseId && <span className="text-orange-500 font-bold">مخصص لكورس</span>}
                      {code.bookId && <span className="text-blue-500 font-bold">مخصص لكتاب</span>}
                      {code.testId && <span className="text-purple-500 font-bold">مخصص لاختبار</span>}
                      {!code.courseId && !code.testId && !code.bookId && <span className="text-emerald-500 font-bold">عام لجميع المنتجات</span>}
                      {code.expiresAt && <span>ينتهي: {new Date(code.expiresAt).toLocaleDateString('ar')}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(code.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
