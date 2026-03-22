'use client'

import { use, useEffect, useState } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  ClipboardList, 
  MessageCircle, 
  Calendar, 
  ChevronLeft,
  ShieldCheck,
  CreditCard,
  History,
  IdCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { SendNotificationModal } from '@/components/admin/send-notification-modal'

interface UserDetail {
  id: number
  name: string
  email: string
  phone: string
  avatarUrl?: string
  isAdmin: boolean
  createdAt: string
  courses: any[]
  attempts: any[]
  chatSessions: any[]
}

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: user, error, isLoading } = useSWR<UserDetail>(`/api/admin/users/${id}`, fetcher)
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false)

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )

  if (error || !user) return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
        <User className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-black">المستخدم غير موجود</h3>
      <Button asChild variant="outline" className="rounded-xl">
        <Link href="/admin/users">العودة لقائمة المستخدمين</Link>
      </Button>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link href="/admin/users">
              <ChevronLeft className="w-6 h-6" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight">تفاصيل المستخدم</h1>
            <p className="text-slate-500 font-bold mt-1">عرض البيانات التاريخية والنشاطات</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsNotifyModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 font-bold h-11 px-6 shadow-lg shadow-blue-500/20"
          >
            <Bell className="w-4 h-4" /> إرسال إشعار
          </Button>
          <div className={cn(
             "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2",
             user.isAdmin ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
           )}>
             <ShieldCheck className="w-4 h-4" />
             {user.isAdmin ? 'مسؤول نظام' : 'مستخدم عادي'}
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sidebar: Profile Info */}
        <div className="space-y-6">
          <div className="p-8 rounded-[32px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="relative inline-block mb-6">
               <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-blue-500/30">
                 {user.name?.[0]}
               </div>
               {user.isAdmin && (
                 <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-xl shadow-lg border-4 border-white dark:border-slate-900">
                   <ShieldCheck className="w-5 h-5" />
                 </div>
               )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{user.name}</h2>
            <p className="text-slate-500 font-bold mt-1">{user.email}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4 text-right">
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <IdCard className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">المعرف الخاص</p>
                  <code className="text-xs font-bold font-mono">{user.id}</code>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <Mail className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">البريد الإلكتروني</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <Phone className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">رقم الهاتف</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{user.phone || 'غير مسجل'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">تاريخ الانضمام</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <span className="text-2xl font-black">{user.courses?.length || 0}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">كورس مشترك</span>
            </div>
            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center gap-2">
              <ClipboardList className="w-6 h-6 text-emerald-500" />
              <span className="text-2xl font-black">{user.attempts?.length || 0}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">اختبار منجز</span>
            </div>
            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex flex-col items-center gap-2">
              <MessageCircle className="w-6 h-6 text-amber-500" />
              <span className="text-2xl font-black">{user.chatSessions?.length || 0}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">جلسة دعم</span>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div className="space-y-4">
             <div className="flex items-center gap-3 mb-2">
                <History className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-black uppercase tracking-tight">الكورسات المشترك بها</h3>
             </div>
             <div className="grid gap-4">
               {user.courses?.map((enroll: any) => (
                 <div key={enroll.id} className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-blue-500/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {enroll.course.image && <img src={enroll.course.image} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white leading-tight">{enroll.course.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded-md border border-emerald-500/20">مدفوع</span>
                           <span className="text-[10px] font-black text-slate-400">{new Date(enroll.createdAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                       <p className="text-sm font-black text-blue-600">{enroll.course.price} ر.س</p>
                    </div>
                 </div>
               ))}
               {!user.courses?.length && (
                 <p className="text-center py-10 text-slate-400 font-bold border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">لم يشترك في أي كورس بعد</p>
               )}
             </div>
          </div>

          {/* Test Attempts */}
          <div className="space-y-4">

              <div className="flex items-center gap-3 mb-2">
                 <ClipboardList className="w-5 h-5 text-emerald-500" />
                 <h3 className="text-lg font-black uppercase tracking-tight">آخر محاولات الاختبار</h3>
              </div>
              <div className="grid gap-4">
                {user.attempts?.map((attempt: any) => (
                  <div key={attempt.id} className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-emerald-500/50 transition-all">
                     <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                         {attempt.status === 'COMPLETED' ? '✓' : '!'}
                       </div>
                       <div>
                         <h4 className="font-black text-slate-900 dark:text-white leading-tight">{attempt.test?.name}</h4>
                         <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                           {new Date(attempt.startedAt).toLocaleDateString('ar-EG')}
                         </p>
                       </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                          attempt.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                        )}>
                          {attempt.status}
                        </span>
                        <Link href={`/results?attemptId=${attempt.id}`}>
                           <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800">
                             <ChevronLeft className="w-4 h-4" />
                           </Button>
                        </Link>
                     </div>
                  </div>
                ))}
                {!user.attempts?.length && (
                  <p className="text-center py-10 text-slate-400 font-bold border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">لم يقم بإجراء أي اختبارات بعد</p>
                )}
              </div>
          </div>
        </div>
      </div>
      
      <SendNotificationModal 
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        user={user ? { id: user.id.toString(), name: user.name } : null}
      />
    </div>
  )
}
