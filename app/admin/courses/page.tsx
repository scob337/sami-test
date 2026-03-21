'use client'

import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Video, Users, Eye } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Course {
  id: number
  title: string
  price: number
  isActive: boolean
  _count: {
    episodes: number
    enrollments: number
  }
}

export default function AdminCoursesPage() {
  const { data: courses, isLoading, mutate } = useSWR<Course[]>('/api/admin/courses', fetcher)

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الكورس؟')) return

    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('تم حذف الكورس بنجاح')
      mutate()
    } catch (error) {
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">إدارة الكورسات</h1>
          <p className="text-slate-500 font-medium">إضافة وتعديل وحذف الكورسات والحلقات</p>
        </div>
        <Link href="/admin/courses/add">
          <Button className="bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-xl gap-2 font-bold h-12 px-6">
            <Plus className="w-5 h-5" /> إضافة كورس جديد
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {courses?.map((course) => (
          <div key={course.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <Video className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{course.title}</h3>
                <div className="flex items-center gap-4 text-sm font-bold text-slate-500">
                  <span className="flex items-center gap-1.5"><Video className="w-4 h-4" /> {course._count.episodes} حلقة</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {course._count.enrollments} مشترك</span>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-500 ${
                    course.isActive 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 opacity-60'
                  }`}>
                    <span className={`inline-block w-1.5 h-1.5 rounded-full ml-1.5 ${course.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    {course.isActive ? 'نشط حالياً' : 'غير نشط'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/admin/courses/${course.id}/episodes`}>
                <Button variant="outline" className="rounded-xl gap-2 font-bold h-11 border-blue-500/20 text-blue-500 hover:bg-blue-500/5">
                  <Video className="w-4 h-4" /> الحلقات
                </Button>
              </Link>
              <Link href={`/admin/courses/${course.id}/edit`}>
                <Button variant="outline" className="rounded-xl gap-2 font-bold h-11">
                  <Edit className="w-4 h-4" /> تعديل
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="rounded-xl gap-2 font-bold h-11 text-rose-500 hover:bg-rose-500/5 hover:text-rose-600"
                onClick={() => handleDelete(course.id)}
              >
                <Trash2 className="w-4 h-4" /> حذف
              </Button>
            </div>
          </div>
        ))}

        {!courses?.length && (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Video className="w-16 h-16 mx-auto text-slate-300 mb-6" />
            <h3 className="text-xl font-black text-slate-400">لا توجد كورسات حالياً</h3>
            <p className="text-slate-500 mb-8">ابدأ بإضافة أول كورس لك الآن</p>
            <Link href="/admin/courses/add">
              <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 font-bold">
                إضافة كورس
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
