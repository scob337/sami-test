'use client'

import { useState, useEffect } from 'react'
import { 
  Users, BookOpen, ClipboardList, CreditCard,
  TrendingUp, Activity, ArrowUpRight, BarChart3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface DashboardStats {
  users: number
  books: number
  tests: number
  payments: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ users: 0, books: 0, tests: 0, payments: 0 })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [usersRes, booksRes, testsRes] = await Promise.all([
          fetch('/api/admin/users'),
          fetch('/api/admin/books'),
          fetch('/api/admin/tests'),
        ])
        const [users, books, tests] = await Promise.all([
          usersRes.json(), booksRes.json(), testsRes.json(),
        ])
        setStats({
          users: Array.isArray(users) ? users.length : 0,
          books: Array.isArray(books) ? books.length : 0,
          tests: Array.isArray(tests) ? tests.length : 0,
          payments: Array.isArray(users) ? users.filter((u: any) => u._count?.payments > 0).length : 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'إجمالي المستخدمين', value: stats.users, icon: Users, color: 'text-primary', bg: 'bg-primary/10', trend: '+12%' },
    { label: 'الكتب المتاحة', value: stats.books, icon: BookOpen, color: 'text-accent-foreground', bg: 'bg-accent/20', trend: '' },
    { label: 'الاختبارات', value: stats.tests, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/10', trend: '' },
    { label: 'عمليات الدفع', value: stats.payments, icon: CreditCard, color: 'text-accent-foreground', bg: 'bg-accent/20', trend: '+8%' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">نظرة عامة</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">مرحباً، إليك ملخص أداء المنصة.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="p-1 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all group overflow-hidden rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 group-hover:scale-110 transition-transform ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.trend && (
                  <div className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                    {stat.trend}
                  </div>
                )}
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 mb-1">{stat.value.toLocaleString('ar-SA')}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'إدارة الأسئلة', desc: 'أضف أو عدّل أسئلة الاختبارات وربطها بالأنماط', href: '/admin/questions', icon: Activity, color: 'text-primary', bg: 'bg-primary/5 hover:bg-primary/10' },
          { title: 'إدارة البرومبتات', desc: 'تحكم في محتوى التقارير المُولَّدة بالذكاء الاصطناعي', href: '/admin/prompts', icon: BarChart3, color: 'text-accent-foreground', bg: 'bg-accent/5 hover:bg-accent/10' },
          { title: 'بيانات المستخدمين', desc: 'راقب نشاط المستخدمين وصدّر البيانات للتسويق', href: '/admin/users', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5 hover:bg-primary/10' },
        ].map(item => (
          <a
            key={item.title}
            href={item.href}
            className={`block p-6 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm hover:border-blue-400 transition-all hover:-translate-y-1 hover:shadow-md group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg border border-gray-100 dark:border-slate-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ${item.bg}`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-300 dark:text-slate-600 group-hover:text-blue-500 transition-all" />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg tracking-tight">{item.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
