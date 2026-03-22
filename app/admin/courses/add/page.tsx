'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ArrowRight, Save, Video, Image as ImageIcon, PlayCircle, X } from 'lucide-react'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FileUploadField } from '@/components/admin/file-upload-field'
import { cn } from '@/lib/utils'

export default function AddCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    image: '',
    introVideoUrl: '',
    videoUrl720: '',
    videoUrl1080: '',
    introThumbnailUrl: '',
    isActive: true,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: ''
  })
  const [episodes, setEpisodes] = useState<any[]>([])

  const addEpisode = () => {
    setEpisodes([...episodes, { title: '', slug: '', videoUrl: '', videoUrl720: '', videoUrl1080: '', thumbnail: '', duration: '', isFree: false }])
  }

  const removeEpisode = (index: number) => {
    setEpisodes(episodes.filter((_, i) => i !== index))
  }

  const updateEpisode = (index: number, data: any) => {
    const newEpisodes = [...episodes]
    newEpisodes[index] = { ...newEpisodes[index], ...data }
    setEpisodes(newEpisodes)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'يرجى إدخال اسم الكورس'
    if (!formData.price.trim()) newErrors.price = 'يرجى تحديد سعر الكورس (0 للمجاني)'
    if (!formData.image) newErrors.image = 'يرجى رفع صورة الغلاف'
    if (!formData.description.trim()) newErrors.description = 'يرجى كتابة وصف للكورس'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error('يرجى ملء كافة الخانات المطلوبة')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, episodes })
      })

      if (!res.ok) throw new Error('Failed to create')
      toast.success('تم إنشاء الكورس بنجاح')
      router.push('/admin/courses')
      router.refresh()
    } catch (error) {
      toast.error('حدث خطأ أثناء الإنشاء')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/courses">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowRight className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">إضافة كورس جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-10" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <Label htmlFor="title" className="text-sm font-bold flex justify-between">
              اسم الكورس
              {errors.title && <span className="text-rose-500 text-[10px] animate-pulse">{errors.title}</span>}
            </Label>
            <Input 
              id="title"
              className={cn(
                "h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20",
                errors.title && "border-rose-500 focus:ring-rose-500/20"
              )}
              placeholder="مثال: تحليل الأنماط المتقدم"
              value={formData.title}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, title: e.target.value }))
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }))
              }}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="price" className="text-sm font-bold flex justify-between">
              السعر (ر.س)
              {errors.price && <span className="text-rose-500 text-[10px] animate-pulse">{errors.price}</span>}
            </Label>
            <Input 
              id="price"
              type="number"
              className={cn(
                "h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20",
                errors.price && "border-rose-500 focus:ring-rose-500/20"
              )}
              placeholder="0 للمجاني"
              value={formData.price}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, price: e.target.value }))
                if (errors.price) setErrors(prev => ({ ...prev, price: '' }))
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-bold flex justify-between">
            وصف الكورس
            {errors.description && <span className="text-rose-500 text-[10px] animate-pulse">{errors.description}</span>}
          </Label>
          <Textarea 
            id="description"
            className={cn(
              "rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500/20 min-h-[120px]",
              errors.description && "border-rose-500 focus:ring-rose-500/20"
            )}
            placeholder="اكتب وصفاً مفصلاً للكورس..."
            value={formData.description}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, description: e.target.value }))
              if (errors.description) setErrors(prev => ({ ...prev, description: '' }))
            }}
          />
        </div>

        {/* Section: Main Image */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#ff5722]">
              <ImageIcon className="w-5 h-5" />
              <h3 className="font-black">صورة الغلاف الأساسية</h3>
            </div>
            {errors.image && <span className="text-rose-500 text-[11px] font-bold animate-pulse">{errors.image}</span>}
          </div>
          <FileUploadField 
            label="اختر صورة غلاف جذابة للكورس"
            value={formData.image}
            onChange={(url) => {
              setFormData(prev => ({ ...prev, image: url }))
              if (errors.image) setErrors(prev => ({ ...prev, image: '' }))
            }}
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
              label="فيديو المقدمة الأساسي (سيكون متاحاً للجميع)"
              value={formData.introVideoUrl}
              onChange={(url) => setFormData(prev => ({ ...prev, introVideoUrl: url }))}
              accept="video/*"
              bucket="videos"
              icon="video"
            />
            <FileUploadField 
              label="فيديو المقدمة 720p (اختياري)"
              value={formData.videoUrl720}
              onChange={(url) => setFormData(prev => ({ ...prev, videoUrl720: url }))}
              accept="video/*"
              bucket="videos"
              icon="video"
            />
            <FileUploadField 
              label="فيديو المقدمة 1080p (اختياري)"
              value={formData.videoUrl1080}
              onChange={(url) => setFormData(prev => ({ ...prev, videoUrl1080: url }))}
              accept="video/*"
              bucket="videos"
              icon="video"
            />
            <FileUploadField 
              label="الصورة المصغرة لفيديو المقدمة"
              value={formData.introThumbnailUrl}
              onChange={(url) => setFormData(prev => ({ ...prev, introThumbnailUrl: url }))}
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
              <h3 className="text-xl font-black">حلقات الكورس</h3>
            </div>
            <Button 
              type="button" 
              onClick={addEpisode}
              variant="outline" 
              className="rounded-xl border-dashed border-indigo-500/50 text-indigo-500 hover:bg-indigo-50"
            >
              + إضافة حلقة جديدة
            </Button>
          </div>

          <div className="space-y-6">
            {episodes.map((ep, idx) => (
              <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6 relative group">
                <Button 
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 left-4 text-slate-400 hover:text-rose-500 rounded-lg"
                  onClick={() => removeEpisode(idx)}
                >
                  <X className="w-5 h-5" />
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-xs font-bold">عنوان الحلقة {idx + 1}</Label>
                    <Input 
                      placeholder="مثال: المقدمة العملية"
                      value={ep.title}
                      className="rounded-xl"
                      onChange={(e) => updateEpisode(idx, { title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-xs font-bold">اسم اللينك (Slug) - اختياري</Label>
                    <Input 
                      placeholder="مثال: introduction"
                      value={ep.slug || ''}
                      className="rounded-xl"
                      onChange={(e) => updateEpisode(idx, { slug: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-6">
                    <Switch 
                      checked={ep.isFree}
                      onCheckedChange={(checked) => updateEpisode(idx, { isFree: checked })}
                    />
                    <Label className="text-xs font-bold">حلقة مجانية (متاحة للجميع)</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FileUploadField 
                    label="ملف الفيديو الأساسي"
                    value={ep.videoUrl}
                    onChange={(url) => updateEpisode(idx, { videoUrl: url })}
                    onDurationChange={(dur) => updateEpisode(idx, { duration: dur })}
                    accept="video/*"
                    bucket="videos"
                    icon="video"
                  />
                  <FileUploadField 
                    label="ملف الفيديو 720p (اختياري)"
                    value={ep.videoUrl720}
                    onChange={(url) => updateEpisode(idx, { videoUrl720: url })}
                    accept="video/*"
                    bucket="videos"
                    icon="video"
                  />
                  <FileUploadField 
                    label="ملف الفيديو 1080p (اختياري)"
                    value={ep.videoUrl1080}
                    onChange={(url) => updateEpisode(idx, { videoUrl1080: url })}
                    accept="video/*"
                    bucket="videos"
                    icon="video"
                  />
                  <FileUploadField 
                    label="صورة عرض الحلقة"
                    value={ep.thumbnail}
                    onChange={(url) => updateEpisode(idx, { thumbnail: url })}
                    accept="image/*"
                    bucket="thumbnails"
                    icon="image"
                  />
                </div>
              </div>
            ))}
            
            {episodes.length === 0 && (
              <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-slate-400 font-bold">
                لا توجد حلقات مضافة بعد. اضغط على الزر أعلاه لإضافة أول حلقة.
              </div>
            )}
          </div>
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

        {/* Section: SEO */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800/50 space-y-6">
          <div className="flex items-center gap-2 text-indigo-500">
            <h3 className="text-xl font-black mb-2">إعدادات محركات البحث (SEO)</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="space-y-3">
              <Label htmlFor="seoTitle" className="text-sm font-bold">العنوان (Meta Title)</Label>
              <Input 
                id="seoTitle"
                placeholder="عنوان مخصص للبحث"
                className="h-12 rounded-xl bg-white dark:bg-slate-900"
                value={formData.seoTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="seoDescription" className="text-sm font-bold">الوصف (Meta Description)</Label>
              <Textarea 
                id="seoDescription"
                placeholder="وصف مختصر للارشفة في محركات البحث"
                className="rounded-xl bg-white dark:bg-slate-900"
                value={formData.seoDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="seoKeywords" className="text-sm font-bold">الكلمات المفتاحية (Keywords)</Label>
              <Input 
                id="seoKeywords"
                placeholder="افصل بين كل كلمة بفاصلة (مثال: كورس, برمجة, تطوير)"
                className="h-12 rounded-xl bg-white dark:bg-slate-900"
                value={formData.seoKeywords}
                onChange={(e) => setFormData(prev => ({ ...prev, seoKeywords: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="h-14 px-10 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            {loading ? <LoadingSpinner size="sm" /> : <Save className="w-5 h-5" />}
            حفظ الكورس
          </Button>
        </div>
      </form>
    </div>
  )
}
