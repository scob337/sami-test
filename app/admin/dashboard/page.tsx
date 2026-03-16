'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { 
  Users, BookOpen, ClipboardList, CreditCard
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

export default function AdminDashboard() {
  const { data, isLoading } = useSWR('/api/admin/dashboard/stats', fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const { stats, chartData, recentUsers } = data || {}

  return (
    <div className="space-y-8" dir="rtl">
      {/* Title Area */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">لوحة التحكم</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">مرحباً بك في نظام إدارة الاختبارات الشخصية</p>
        </div>
      </div>

      {/* Row 1: Real Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'المستخدمين', value: stats?.users || 0, icon: Users, color: '#ff9800', bg: 'bg-orange-50' },
          { label: 'الكتب', value: stats?.books || 0, icon: BookOpen, color: '#03a9f4', bg: 'bg-blue-50' },
          { label: 'الاختبارات', value: stats?.tests || 0, icon: ClipboardList, color: '#8bc34a', bg: 'bg-green-50' },
          { label: 'المبيعات', value: `£${stats?.sales || 0}`, icon: CreditCard, color: '#e91e63', bg: 'bg-pink-50' },
        ].map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-shadow group">
            <div className={`w-14 h-14 rounded-2xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <card.icon className="w-7 h-7" style={{ color: card.color }} />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">{card.label}</div>
              <div className="text-3xl font-black text-slate-800">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dynamic Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800">إحصائيات المستخدمين الجدد</h3>
            <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-widest">آخر 6 أشهر</span>
          </div>
          <div className="h-[350px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#03a9f4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#03a9f4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', direction: 'rtl' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  name="المستخدمين الجدد"
                  stroke="#03a9f4" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Users */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800">أحدث المستخدمين</h3>
            <a href="/admin/users" className="text-blue-500 text-xs font-bold hover:underline">عرض الكل</a>
          </div>
          <div className="space-y-6 flex-1">
            {recentUsers?.map((user: any) => (
              <div key={user.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{user.name}</div>
                    <div className="text-xs text-slate-400 font-medium">{format(new Date(user.createdAt), 'd MMM yyyy', { locale: ar })}</div>
                  </div>
                </div>
                <div className="text-xs font-bold bg-green-50 text-green-600 px-2.5 py-1 rounded-lg">
                  {user._count.attempts} اختبار
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
