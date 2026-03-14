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
    { label: 'إجمالي المستخدمين', value: stats.users, icon: Users, color: 'text-primary', bg: 'bg-primary/15', trend: '+12%' },
    { label: 'الكتب المتاحة', value: stats.books, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100/80', trend: '' },
    { label: 'الاختبارات', value: stats.tests, icon: ClipboardList, color: 'text-amber-600', bg: 'bg-amber-100/80', trend: '' },
    { label: 'عمليات الدفع', value: stats.payments, icon: CreditCard, color: 'text-violet-600', bg: 'bg-violet-100/80', trend: '+8%' },
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
        <h2 className="text-2xl font-bold tracking-tight text-foreground">نظرة عامة</h2>
        <p className="text-sm text-muted-foreground mt-1">مرحباً، إليك ملخص أداء المنصة.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border border-border shadow-sm hover:shadow-md transition-all bg-card rounded-2xl overflow-hidden group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                {stat.trend && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-1 rounded-lg">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="text-3xl font-black text-foreground mb-1">{stat.value.toLocaleString('ar-SA')}</div>
              <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-5 md:grid-cols-3">
        {[
          { title: 'إدارة الأسئلة', desc: 'أضف أو عدّل أسئلة الاختبارات وربطها بالأنماط', href: '/admin/questions', icon: Activity, color: 'text-primary', bg: 'from-primary/5 to-primary/15' },
          { title: 'إدارة البرومبتات', desc: 'تحكم في محتوى التقارير المُولَّدة بالذكاء الاصطناعي', href: '/admin/prompts', icon: BarChart3, color: 'text-violet-600', bg: 'from-violet-50 to-violet-100/80' },
          { title: 'بيانات المستخدمين', desc: 'راقب نشاط المستخدمين وصدّر البيانات للتسويق', href: '/admin/users', icon: TrendingUp, color: 'text-emerald-600', bg: 'from-emerald-50 to-emerald-100/80' },
        ].map(item => (
          <a
            key={item.title}
            href={item.href}
            className={`block p-5 rounded-2xl bg-gradient-to-br ${item.bg} border border-border/50 hover:border-border transition-all hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-card shadow-sm border border-border flex items-center justify-center">
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground/50 mr-auto rotate-0 group-hover:rotate-45 transition-transform" />
            </div>
            <p className="font-bold text-foreground text-sm">{item.title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
