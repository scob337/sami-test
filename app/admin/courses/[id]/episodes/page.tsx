'use client'

import { useState, use } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Video, ArrowRight, Loader2, Play } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { FileUploadField } from '@/components/admin/file-upload-field'

interface Episode {
  id: number
  title: string
  videoUrl: string
  thumbnail: string
  duration: string
  isFree: boolean
  sortOrder: number
}

export default function AdminEpisodesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params)
  const { data: episodes, isLoading, mutate } = useSWR<Episode[]>(`/api/admin/courses/${courseId}/episodes`, fetcher)
  
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    videoUrl: '',
    videoUrl720: '',
    videoUrl1080: '',
    thumbnail: '',
    duration: '',
    isFree: false
  })

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.videoUrl) {
      toast.error('يرجى ملء الحقول الأساسية')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/episodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, sortOrder: (episodes?.length || 0) + 1 })
      })
      if (!res.ok) throw new Error()
      toast.success('تم إضافة الحلقة بنجاح')
      setIsAdding(false)
      setFormData({ title: '', slug: '', videoUrl: '', videoUrl720: '', videoUrl1080: '', thumbnail: '', duration: '', isFree: false })
      mutate()
    } catch (error) {
      toast.error('فشل في إضافة الحلقة')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (episodeId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحلقة؟')) return
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/episodes/${episodeId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('تم حذف الحلقة')
      mutate()
    } catch {
      toast.error('فشل الحذف')
    }
  }

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/courses">
            <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 dark:bg-slate-800">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">إدارة الحلقات</h1>
            <p className="text-slate-500 font-medium small">إضافة وترتيب حلقات الكورس</p>
          </div>
        </div>
        <Button 
          onClick={() => setIsAdding(!isAdding)}
          className={cn("rounded-xl gap-2 font-bold h-12", isAdding ? "bg-slate-200 text-slate-900" : "bg-blue-600 text-white")}
        >
          {isAdding ? 'إلغاء' : <><Plus className="w-5 h-5" /> إضافة حلقة</>}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-xl space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black mx-1">عنوان الحلقة</label>
              <input 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="مثال: مقدمة في لغة جافا سكريبت"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black mx-1">اسم اللينك (Slug) - اختياري</label>
              <input 
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
                placeholder="مثال: introduction"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <FileUploadField 
                  label="ملف فيديو الحلقة (MP4/WebM)" 
                  value={formData.videoUrl} 
                  onChange={(url) => setFormData(prev => ({...prev, videoUrl: url}))} 
                  onDurationChange={(d) => setFormData(prev => ({...prev, duration: d}))}
                  accept="video/*" 
                  bucket="videos" 
                  icon="video" 
                />
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <FileUploadField 
                  label="فيديو بجودة 720p (اختياري)" 
                  value={formData.videoUrl720} 
                  onChange={(url) => setFormData(prev => ({...prev, videoUrl720: url}))} 
                  accept="video/*" 
                  bucket="videos" 
                  icon="video" 
                />
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <FileUploadField 
                  label="فيديو بجودة 1080p (اختياري)" 
                  value={formData.videoUrl1080} 
                  onChange={(url) => setFormData(prev => ({...prev, videoUrl1080: url}))} 
                  accept="video/*" 
                  bucket="videos" 
                  icon="video" 
                />
              </div>
              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <FileUploadField 
                  label="الصورة المصغرة للحلقة (اختياري)" 
                  value={formData.thumbnail} 
                  onChange={(url) => setFormData(prev => ({...prev, thumbnail: url}))} 
                  accept="image/*" 
                  bucket="thumbnails" 
                  icon="image" 
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 pt-4">
             <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={e => setFormData({...formData, isFree: e.target.checked})}
                  className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 transition-all"
                />
                <span className="text-sm font-black">جعل هذه الحلقة مجانية للمعاينة</span>
             </label>
             <Button type="submit" disabled={loading} className="h-12 px-10 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-black gap-3 shadow-xl shadow-emerald-500/20">
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
               حفظ الحلقة
             </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {episodes?.map((episode, index) => (
          <div key={episode.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between group hover:shadow-lg transition-all">
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-400">
                {index + 1}
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white mb-1 flex items-center gap-3">
                  {episode.title}
                  {episode.isFree && <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">مجاني</span>}
                </h4>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                   <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> {episode.duration || 'غير محدد'}</span>
                   <span className="truncate max-w-[200px] opacity-60">{episode.videoUrl}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
               <Button 
                variant="ghost" 
                size="icon" 
                className="text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                onClick={() => handleDelete(episode.id)}
               >
                 <Trash2 className="w-5 h-5" />
               </Button>
            </div>
          </div>
        ))}

        {!episodes?.length && !isAdding && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
             <Video className="w-12 h-12 mx-auto text-slate-300 mb-4" />
             <p className="font-black text-slate-400 text-lg">لا توجد حلقات مضافة بعد</p>
             <p className="text-sm font-medium text-slate-500 mb-6">ابدأ بملء محتوى الكورس الآن لزيادة المبيعات</p>
          </div>
        )}
      </div>
    </div>
  )
}
