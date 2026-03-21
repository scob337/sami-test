'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Bell, Send, Trash2, Loader2, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function AdminNotificationsPage() {
  const { data: notifications, mutate, isLoading } = useSWR<any[]>('/api/admin/notifications', fetcher)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ title: '', content: '', type: 'info' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!res.ok) throw new Error()
      toast.success('تم إرسال الإشعار بنجاح')
      setFormData({ title: '', content: '', type: 'info' })
      mutate()
    } catch {
      toast.error('فشل في إرسال الإشعار')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/admin/notifications?id=${id}`, { method: 'DELETE' })
      toast.success('تم حذف الإشعار')
      mutate()
    } catch {
      toast.error('فشل الحذف')
    }
  }

  if (isLoading) return <div className="flex justify-center p-12"><LoadingSpinner /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-500/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20">
          <Bell className="w-8 h-8 text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-black">إرسال إشعارات عامة</h1>
          <p className="text-slate-500 font-medium small">تواصل مع جميع مستخدمي المنصة بضغطة واحدة</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black mx-1">عنوان الإشعار</label>
            <input 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="مثال: تحديث جديد للمنصة!"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-black mx-1">محتوى الرسالة</label>
            <textarea 
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="اكتب تفاصيل الإشعار هنا..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[120px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'info', label: 'معلومات', color: 'blue', desc: 'تحديثات عامة أو أخبار بسيطة' },
              { id: 'success', label: 'نجاح', color: 'emerald', desc: 'إطلاق ميزة جديدة أو عرض خاص' },
              { id: 'warning', label: 'تنبيه', color: 'amber', desc: 'تحذير هام أو صيانة مجدولة' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFormData({...formData, type: t.id})}
                className={cn(
                  "p-4 rounded-2xl border-2 transition-all text-right group",
                  formData.type === t.id 
                    ? `border-${t.color}-500 bg-${t.color}-500/10 shadow-lg shadow-${t.color}-500/10` 
                    : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-xs font-black uppercase tracking-wider",
                    formData.type === t.id ? `text-${t.color}-500` : "text-slate-400"
                  )}>
                    {t.label}
                  </span>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    formData.type === t.id ? `bg-${t.color}-500 animate-pulse` : "bg-slate-300 dark:bg-slate-700"
                  )} />
                </div>
                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">
                  {t.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg gap-4 shadow-xl shadow-blue-500/20">
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 rotate-180" />}
          بث الإشعار الآن
        </Button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-black flex items-center gap-2 px-2">
          <Bell className="w-5 h-5 opacity-50" /> الإشعارات الأخيرة
        </h2>
        {notifications?.map(n => (
          <div key={n.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                n.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
                n.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
              }`}>
                <Megaphone className="w-5 h-5" />
              </div>
              <div className="text-right">
                <p className="font-black text-sm">{n.title}</p>
                <p className="text-xs font-medium text-slate-500 truncate max-w-md">{n.content}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-rose-500 opacity-0 group-hover:opacity-100 rounded-xl" onClick={() => handleDelete(n.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
