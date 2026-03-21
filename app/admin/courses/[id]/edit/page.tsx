'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ArrowRight, Save, Image as ImageIcon, PlayCircle, Tag, Plus, Trash2, Percent, DollarSign, Video, X } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FileUploadField } from '@/components/admin/file-upload-field'
import { cn } from '@/lib/utils'

interface DiscountCode {
  id: number
  code: string
  discount: number
  type: string
  isActive: boolean
  expiresAt: string | null
}

interface Course {
  title: string
  description: string
  price: number
  image: string
  introVideoUrl: string
  introThumbnailUrl: string
  isActive: boolean
  discountCodes?: DiscountCode[]
}

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: course, isLoading, mutate } = useSWR<Course>(`/api/admin/courses/${id}`, fetcher)
  const { data: existingEpisodes, mutate: mutateEpisodes } = useSWR<any[]>(`/api/admin/courses/${id}/episodes`, fetcher)
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
    introVideoUrl: '',
    introThumbnailUrl: '',
    isActive: true
  })

  // Discount code state
  const [newCode, setNewCode] = useState('')
  const [newDiscount, setNewDiscount] = useState('')
  const [newType, setNewType] = useState<'PERCENT' | 'FIXED'>('PERCENT')
  const [addingCode, setAddingCode] = useState(false)

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        price: course.price?.toString() || '0',
        image: course.image || '',
        introVideoUrl: course.introVideoUrl || '',
        introThumbnailUrl: course.introThumbnailUrl || '',
        isActive: course.isActive ?? true
      })
    }
  }, [course])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to update')
      toast.success('تم تحديث الكورس بنجاح')
      router.push('/admin/courses')
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
          courseId: parseInt(id)
        })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }
      toast.success('تم إضافة كود الخصم بنجاح')
      setNewCode('')
      setNewDiscount('')
      mutate()
    } catch (err: any) {
      toast.error(err.message || 'فشل إضافة الكود')
    } finally {
      setAddingCode(false)
    }
  }

  const handleDeleteDiscount = async (discountId: number) => {
    try {
      const res = await fetch(`/api/admin/discounts/${discountId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('تم حذف كود الخصم')
      mutate()
    } catch {
      toast.error('فشل الحذف')
    }
  }

  // Episode management
  const [newEpisodes, setNewEpisodes] = useState<any[]>([])
  const [addingEpisode, setAddingEpisode] = useState(false)

  const addNewEpisodeRow = () => {
    setNewEpisodes([...newEpisodes, { title: '', videoUrl: '', thumbnail: '', duration: '', isFree: false }])
  }

  const updateNewEpisode = (index: number, data: any) => {
    const updated = [...newEpisodes]
    updated[index] = { ...updated[index], ...data }
    setNewEpisodes(updated)
  }

  const removeNewEpisodeRow = (index: number) => {
    setNewEpisodes(newEpisodes.filter((_, i) => i !== index))
  }

  const saveNewEpisode = async (index: number) => {
    const ep = newEpisodes[index]
    if (!ep.title || !ep.videoUrl) {
      toast.error('يرجى إدخال عنوان الحلقة ورفع الفيديو')
      return
    }
    setAddingEpisode(true)
    try {
      const sortOrder = (existingEpisodes?.length || 0) + index + 1
      const res = await fetch(`/api/admin/courses/${id}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...ep, sortOrder })
      })
      if (!res.ok) throw new Error()
      toast.success('تم إضافة الحلقة بنجاح')
      setNewEpisodes(newEpisodes.filter((_, i) => i !== index))
      mutateEpisodes()
    } catch {
      toast.error('فشل إضافة الحلقة')
    } finally {
      setAddingEpisode(false)
    }
  }

  const deleteEpisode = async (episodeId: number) => {
    try {
      const res = await fetch(`/api/admin/episodes/${episodeId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('تم حذف الحلقة')
      mutateEpisodes()
    } catch {
      toast.error('فشل الحذف')
    }
  }

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">تعديل الكورس</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-bold">اسم الكورس</Label>
            <Input 
              id="title"
              required
              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="price" className="text-sm font-bold">السعر (ر.س)</Label>
            <Input 
              id="price"
              type="number"
              required
              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-bold">وصف الكورس</Label>
          <Textarea 
            id="description"
            className="rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 min-h-[120px]"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Section: Main Image */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-2 mb-4 text-[#ff5722]">
            <ImageIcon className="w-5 h-5" />
            <h3 className="font-black">صورة الغلاف الأساسية</h3>
          </div>
          <FileUploadField 
            label="تعديل صورة غلاف الكورس"
            value={formData.image}
            onChange={(url) => setFormData({ ...formData, image: url })}
            accept="image/*"
            bucket="thumbnails"
            icon="image"
          />
        </div>

        {/* Section: Free Intro Video */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-2 mb-4 text-blue-500">
            <PlayCircle className="w-5 h-5" />
            <h3 className="font-black">عرض المقدمة المجاني (Intro)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FileUploadField 
              label="فيديو المقدمة (سيكون متاحاً للجميع)"
              value={formData.introVideoUrl}
              onChange={(url) => setFormData({ ...formData, introVideoUrl: url })}
              accept="video/*"
              bucket="videos"
              icon="video"
            />
            <FileUploadField 
              label="الصورة المصغرة لفيديو المقدمة"
              value={formData.introThumbnailUrl}
              onChange={(url) => setFormData({ ...formData, introThumbnailUrl: url })}
              accept="image/*"
              bucket="thumbnails"
              icon="image"
            />
          </div>
        </div>

        {/* Section: Episodes Management */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-500">
              <Video className="w-6 h-6" />
              <h3 className="text-xl font-black">حلقات الكورس ({existingEpisodes?.length || 0})</h3>
            </div>
            <Button 
              type="button" 
              onClick={addNewEpisodeRow}
              variant="outline" 
              className="rounded-xl border-dashed border-indigo-500/50 text-indigo-500 hover:bg-indigo-50"
            >
              + إضافة حلقة جديدة
            </Button>
          </div>

          {/* Existing Episodes */}
          {existingEpisodes && existingEpisodes.length > 0 && (
            <div className="space-y-3">
              {existingEpisodes.map((ep, idx) => (
                <div key={ep.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-black text-sm">{ep.title}</p>
                      <p className="text-xs font-bold text-slate-500">
                        {ep.duration || '—'} • {ep.isFree ? 'مجانية' : 'مدفوعة'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => deleteEpisode(ep.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* New Episodes */}
          {newEpisodes.map((ep, idx) => (
            <div key={`new-${idx}`} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative group">
              <Button 
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-4 left-4 text-slate-400 hover:text-rose-500 rounded-lg"
                onClick={() => removeNewEpisodeRow(idx)}
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-xs font-bold">عنوان الحلقة</Label>
                  <Input 
                    placeholder="مثال: المقدمة العملية"
                    value={ep.title}
                    className="rounded-xl"
                    onChange={(e) => updateNewEpisode(idx, { title: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <Switch 
                    checked={ep.isFree}
                    onCheckedChange={(checked) => updateNewEpisode(idx, { isFree: checked })}
                  />
                  <Label className="text-xs font-bold">حلقة مجانية (متاحة للجميع)</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FileUploadField 
                  label="ملف الفيديو"
                  value={ep.videoUrl}
                  onChange={(url) => updateNewEpisode(idx, { videoUrl: url })}
                  onDurationChange={(dur) => updateNewEpisode(idx, { duration: dur })}
                  accept="video/*"
                  bucket="videos"
                  icon="video"
                />
                <FileUploadField 
                  label="صورة عرض الحلقة"
                  value={ep.thumbnail}
                  onChange={(url) => updateNewEpisode(idx, { thumbnail: url })}
                  accept="image/*"
                  bucket="thumbnails"
                  icon="image"
                />
              </div>

              {ep.duration && (
                <p className="text-xs font-bold text-indigo-500">⏱ المدة المكتشفة تلقائياً: {ep.duration}</p>
              )}

              <Button
                type="button"
                onClick={() => saveNewEpisode(idx)}
                disabled={addingEpisode || !ep.title || !ep.videoUrl}
                className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black gap-2 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {addingEpisode ? <LoadingSpinner size="sm" /> : <Plus className="w-5 h-5" />}
                حفظ الحلقة
              </Button>
            </div>
          ))}

          {(!existingEpisodes || existingEpisodes.length === 0) && newEpisodes.length === 0 && (
            <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 font-bold">
              لا توجد حلقات مضافة بعد. اضغط على الزر أعلاه لإضافة أول حلقة.
            </div>
          )}
        </div>

        {/* Section: Discount Codes */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 space-y-6">
          <div className="flex items-center gap-2 text-emerald-500">
            <Tag className="w-6 h-6" />
            <h3 className="text-xl font-black">أكواد الخصم</h3>
          </div>

          {/* Add New Code */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-sm font-black text-slate-600 dark:text-slate-400">إضافة كود خصم جديد</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">كود الخصم</Label>
                <Input
                  placeholder="مثال: SALE50"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  className="h-12 rounded-xl bg-white dark:bg-slate-900 uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">قيمة الخصم</Label>
                <Input
                  type="number"
                  placeholder={newType === 'PERCENT' ? "مثال: 20" : "مثال: 50"}
                  value={newDiscount}
                  onChange={(e) => setNewDiscount(e.target.value)}
                  className="h-12 rounded-xl bg-white dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold">نوع الخصم</Label>
                <div className="flex gap-2 h-12">
                  <button
                    type="button"
                    onClick={() => setNewType('PERCENT')}
                    className={cn(
                      "flex-1 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all",
                      newType === 'PERCENT'
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-400 hover:border-emerald-500/50"
                    )}
                  >
                    <Percent className="w-4 h-4" /> نسبة
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('FIXED')}
                    className={cn(
                      "flex-1 rounded-xl border-2 flex items-center justify-center gap-2 font-bold text-sm transition-all",
                      newType === 'FIXED'
                        ? "border-blue-500 bg-blue-500/10 text-blue-600"
                        : "border-slate-200 dark:border-slate-700 text-slate-400 hover:border-blue-500/50"
                    )}
                  >
                    <DollarSign className="w-4 h-4" /> ثابت
                  </button>
                </div>
              </div>
            </div>
            <Button
              type="button"
              onClick={handleAddDiscount}
              disabled={addingCode}
              className="h-12 px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              {addingCode ? <LoadingSpinner size="sm" /> : <Plus className="w-5 h-5" />}
              إضافة الكود
            </Button>
          </div>

          {/* Existing Codes */}
          {course?.discountCodes && course.discountCodes.length > 0 ? (
            <div className="space-y-3">
              {course.discountCodes.map((dc) => (
                <div key={dc.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 group hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-lg">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm tracking-widest">{dc.code}</p>
                      <p className="text-xs font-bold text-slate-500">
                        خصم {dc.discount}{dc.type === 'PERCENT' ? '%' : ' ر.س'}
                        {dc.expiresAt && ` • ينتهي ${new Date(dc.expiresAt).toLocaleDateString('ar-EG')}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleDeleteDiscount(dc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 font-bold text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              لا توجد أكواد خصم لهذا الكورس بعد
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <h4 className="font-bold">حالة الكورس</h4>
            <p className="text-xs text-slate-500">تفعيل أو تعطيل ظهور الكورس للمستخدمين</p>
          </div>
          <Switch 
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="h-14 px-10 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            {loading ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5" />}
            تحديث الكورس
          </Button>
        </div>
      </form>
    </div>
  )
}
