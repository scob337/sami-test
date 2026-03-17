'use client'

import { useMemo } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { 
  Users, BookOpen, ClipboardList, CreditCard, Plus, ExternalLink
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface DashboardStats {
  users: number
  books: number
  tests: number
  sales: number
}

interface ChartData {
  name: string
  users: number
}

interface RecentUser {
  id: string
  name: string
  email: string
  createdAt: string
  _count: {
    attempts: number
  }
}

interface DashboardData {
  stats: DashboardStats
  chartData: ChartData[]
  recentUsers: RecentUser[]
}

export default function AdminDashboard() {
  const { data, isLoading } = useSWR<DashboardData>('/api/admin/dashboard/stats', fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const { stats, chartData, recentUsers } = data || {
    stats: { users: 0, books: 0, tests: 0, sales: 0 },
    chartData: [],
    recentUsers: []
  }

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
                    <stop offset="5%" stopColor="#ff5722" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff5722" stopOpacity={0}/>
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
                  stroke="#ff5722" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Users */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-[#64748b] dark:text-slate-400 mb-4">آخر المستخدمين المنضمين</h3>
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#15283c] flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1e293b] dark:text-slate-200">{user.name}</p>
                    <p className="text-xs text-[#64748b] dark:text-slate-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">{new Date(user.createdAt).toLocaleDateString('ar-SA')}</p>
                  <p className="text-xs font-bold text-[#ff5722]">{user._count.attempts} محاولات</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-6 text-[#15283c] dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl" onClick={() => (window.location.href = '/admin/users')}>
            عرض جميع المستخدمين
          </Button>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
              <Plus className="w-4 h-4 text-[#ff5722]" />
            </div>
            <h2 className="text-lg font-black text-[#1e293b] dark:text-slate-200">إجراءات سريعة</h2>
          </div>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col gap-2 rounded-2xl border-slate-100 dark:border-slate-800 hover:border-[#ff5722] hover:bg-orange-50/50 dark:hover:bg-orange-950/10 group transition-all"
            onClick={() => (window.location.href = '/admin/tests')}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[#ff5722] group-hover:text-white transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#64748b] group-hover:text-[#ff5722]">اختبار جديد</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex flex-col gap-2 rounded-2xl border-slate-100 dark:border-slate-800 hover:border-[#15283c] hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-all"
            onClick={() => (window.location.href = '/admin/books')}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-[#15283c] group-hover:text-white transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#64748b] group-hover:text-[#15283c]">كتاب جديد</span>
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color, trend }: any) {
  return (
    <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden group hover:shadow-md transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-full">
              +{trend}%
            </span>
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-[#64748b] dark:text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-black text-[#1e293b] dark:text-slate-100">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
