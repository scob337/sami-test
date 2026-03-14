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
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
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
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { title: 'إدارة الأسئلة', desc: 'أضف أو عدّل أسئلة الاختبارات وربطها بالأنماط', href: '/admin/questions', icon: Activity, color: 'text-primary', bg: 'bg-primary/5 hover:bg-primary/10' },
          { title: 'إدارة البرومبتات', desc: 'تحكم في محتوى التقارير المُولَّدة بالذكاء الاصطناعي', href: '/admin/prompts', icon: BarChart3, color: 'text-accent-foreground', bg: 'bg-accent/5 hover:bg-accent/10' },
          { title: 'بيانات المستخدمين', desc: 'راقب نشاط المستخدمين وصدّر البيانات للتسويق', href: '/admin/users', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/5 hover:bg-primary/10' },
        ].map(item => (
          <a
            key={item.title}
            href={item.href}
            className={`block p-6 rounded-[2rem] bg-card/40 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-xl group ${item.bg}`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-muted-foreground/30 mr-auto group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
            </div>
            <h3 className="font-black text-foreground text-lg tracking-tight">{item.title}</h3>
            <p className="text-sm font-bold text-muted-foreground mt-2 leading-relaxed opacity-80">{item.desc}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
