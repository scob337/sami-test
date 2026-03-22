'use client'

import { use } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  BarChart, 
  Users, 
  CreditCard,
  ChevronLeft,
  TrendingUp,
  Mail,
  Calendar,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface StatsData {
  course: {
    id: number
    title: string
    price: number
    image: string
    isActive: boolean
    stats: {
      revenue: number
      enrollments: number
      ratings: number
    }
  }
  payments: any[]
  subscribers: any[]
}

export default function AdminCourseStatsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, error, isLoading } = useSWR<StatsData>(`/api/admin/courses/${id}/stats`, fetcher)

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  )

  if (error || !data) return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
        <BarChart className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-black">تعذر تحميل الإحصائيات</h3>
      <Button asChild variant="outline" className="rounded-xl">
        <Link href="/admin/courses">العودة لقائمة الكورسات</Link>
      </Button>
    </div>
  )

  const { course, payments, subscribers } = data

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="rounded-xl">
            <Link href="/admin/courses">
              <ChevronLeft className="w-6 h-6" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              إحصائيات الإيرادات
            </h1>
            <p className="text-slate-500 font-bold mt-1 text-sm">{course.title}</p>
          </div>
        </div>
        <div className="hidden sm:block">
           <Badge variant={course.isActive ? "default" : "secondary"} className={cn("px-4 py-1.5 rounded-xl font-black text-xs", course.isActive ? "bg-emerald-500 hover:bg-emerald-600" : "")}>
             {course.isActive ? 'مفعل ومتاح' : 'تم تعطيل الكورس'}
           </Badge>
        </div>
      </div>

      {/* Main Stats Ticker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-8 rounded-[2rem] bg-indigo-600 border border-indigo-500 text-white flex flex-col items-start gap-4 shadow-xl shadow-indigo-600/20 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <span className="block text-4xl font-black mb-1">{course.stats.revenue.toLocaleString()} <span className="text-lg opacity-60">ر.س</span></span>
            <span className="text-sm font-bold opacity-80 uppercase tracking-widest">إجمالي الإيرادات</span>
          </div>
          <TrendingUp className="w-24 h-24 absolute -bottom-4 -left-4 text-white/5" />
        </div>

        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <span className="block text-4xl font-black text-slate-900 dark:text-white mb-1">{course.stats.enrollments}</span>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">المشتركين</span>
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <span className="block text-4xl font-black text-slate-900 dark:text-white mb-1">{payments.length}</span>
            <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">عمليات الدفع الناجحة</span>
          </div>
        </div>
      </div>

      {/* Subscriber List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800/50 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-800/20">
           <Users className="w-6 h-6 text-blue-500" />
           <h2 className="text-xl font-black text-slate-900 dark:text-white">سجل المشتركين والدفع</h2>
        </div>
        
        {subscribers.length === 0 ? (
          <div className="p-12 text-center">
             <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
             </div>
             <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">لا يوجد مشتركون بعد</h3>
             <p className="text-slate-500 font-bold text-sm">لم يقم أحد بالاشتراك في هذا الكورس حتى الآن.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-wider">
                  <th className="p-5 font-black">المستخدم</th>
                  <th className="p-5 font-black">البريد الإلكتروني</th>
                  <th className="p-5 font-black text-center">تاريخ الاشتراك</th>
                  <th className="p-5 font-black text-center">حالة الدفع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {subscribers.map((sub: any) => {
                  // Find if this subscriber has a related successful payment
                  const payment = payments.find((p: any) => p.userId === sub.user.id)
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-5">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-black shadow-md">
                             {sub.user.name?.[0] || 'U'}
                           </div>
                           <Link href={`/admin/users/${sub.user.id}`} className="font-black text-slate-900 dark:text-white hover:text-blue-500 transition-colors">
                             {sub.user.name || 'مستخدم'}
                           </Link>
                         </div>
                      </td>
                      <td className="p-5">
                         <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                           <Mail className="w-4 h-4 opacity-50" />
                           {sub.user.email}
                         </div>
                      </td>
                      <td className="p-5 text-center">
                         <div className="flex justify-center items-center gap-2 text-slate-500 text-xs font-bold">
                           <Calendar className="w-3.5 h-3.5 opacity-50" />
                           {new Date(sub.createdAt).toLocaleDateString('ar-EG')}
                         </div>
                      </td>
                      <td className="p-5 text-center">
                         {payment ? (
                           <div className="inline-flex flex-col items-center">
                             <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 px-3 py-1 font-black mb-1 border-none shadow-none">
                               تم الدفع ({payment.amount} ر.س)
                             </Badge>
                             {payment.discountCode && (
                               <span className="text-[10px] font-bold text-amber-500">
                                 كود: {payment.discountCode.code}
                               </span>
                             )}
                           </div>
                         ) : (
                           <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 px-3 py-1 font-black border-none shadow-none">
                             وصول مجاني (عبر الإدارة)
                           </Badge>
                         )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
