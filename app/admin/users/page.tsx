'use client'
import Link from 'next/link'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { Search, Mail, Phone, Calendar, Download, Users, CreditCard, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string | null
  phone: string | null
  createdAt: string
  _count: { attempts: number; payments: number }
  attempts: { status: string; result?: unknown }[]
}

function getUserStatus(user: User): { label: string; class: string; icon: React.ElementType } {
  if (user._count?.payments > 0) return { label: 'تم الدفع', class: 'bg-emerald-100 text-emerald-700', icon: CreditCard }
  const last = user.attempts?.[0]
  if (last?.status === 'COMPLETED') return { label: 'أكمل الاختبار', class: 'bg-blue-100 text-blue-700', icon: CheckCircle2 }
  if (last?.status === 'IN_PROGRESS') return { label: 'بدأ الاختبار', class: 'bg-amber-100 text-amber-700', icon: Clock }
  return { label: 'لم يبدأ', class: 'bg-slate-100 text-slate-500', icon: Users }
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  
  const { data: usersData, isLoading } = useSWR<User[]>(
    `/api/admin/users${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`,
    fetcher,
    { keepPreviousData: true }
  )

  const users = usersData || []

  const stats = useMemo(() => {
    const paid = users.filter(u => u._count?.payments > 0).length
    const completed = users.filter(u => u.attempts?.[0]?.status === 'COMPLETED' && u._count?.payments === 0).length
    const inProgress = users.filter(u => u.attempts?.[0]?.status === 'IN_PROGRESS').length
    return { paid, completed, inProgress, total: users.length }
  }, [users])

  const handleExportCSV = () => {
    if (!users.length) { toast.error('لا توجد بيانات للتصدير'); return }
    const headers = ['الاسم', 'البريد', 'الهاتف', 'الحالة', 'الاختبارات', 'تاريخ التسجيل']
    const rows = users.map(u => {
      const status = getUserStatus(u)
      return [
        u.name,
        u.email ?? '-',
        u.phone ?? '-',
        status.label,
        u._count?.attempts ?? 0,
        new Date(u.createdAt).toLocaleDateString('ar-SA'),
      ]
    })
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('تم تصدير البيانات')
  }

  // Summary stats
  const paid = users.filter(u => u._count?.payments > 0).length
  const completed = users.filter(u => u.attempts?.[0]?.status === 'COMPLETED' && u._count?.payments === 0).length
  const inProgress = users.filter(u => u.attempts?.[0]?.status === 'IN_PROGRESS').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">إدارة المستخدمين</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{users.length} مستخدم مسجل</p>
        </div>
        <Button
          onClick={handleExportCSV}
          className="flex items-center gap-2 rounded-xl bg-[#15283c] hover:bg-[#1a334d] text-white shadow-lg shadow-navy-500/20 px-5 h-11 font-semibold transition-all active:scale-95"
        >
          <Download className="w-4 h-4" />
          تصدير ملف Excel (CSV)
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المستخدمين', value: stats.total, icon: Users, color: 'text-primary', bg: 'bg-primary/15' },
          { label: 'دفعوا', value: stats.paid, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-100/80' },
          { label: 'أكملوا الاختبار', value: stats.completed, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100/80' },
          { label: 'في منتصف الطريق', value: stats.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100/80' },
        ].map(stat => (
          <Card key={stat.label} className="border border-border/50 shadow-sm bg-card rounded-2xl">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card className="border border-border/50 shadow-sm bg-card rounded-2xl overflow-hidden">
        <CardHeader className="px-5 py-3.5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="ابحث بالاسم أو البريد أو الهاتف..."
              className="bg-transparent border-none focus:outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </CardHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16"><LoadingSpinner size="lg" /></div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Users className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="font-bold text-muted-foreground text-sm">لا يوجد مستخدمون بعد</p>
          </div>
        ) : (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[#64748b] dark:text-slate-400 text-[11px] font-black uppercase tracking-wider">
                    <th className="py-4 px-6 text-right">بيانات المستخدم</th>
                    <th className="py-4 px-6 text-center">حالة الاشتراك</th>
                    <th className="py-4 px-6 text-center">حالة النشاط</th>
                    <th className="py-4 px-6 text-center">المحاولات</th>
                    <th className="py-4 px-6 text-right">تاريخ الانضمام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map(user => {
                    const status = getUserStatus(user)
                    const StatusIcon = status.icon
                    return (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                        <td className="py-5 px-6">
                          <Link href={`/admin/users/${user.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                            <div className="w-12 h-12 rounded-[14px] bg-[#15283c] flex items-center justify-center text-white font-black text-lg shrink-0 shadow-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-[#1e293b] dark:text-slate-200 text-base leading-tight">{user.name}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                {user.email && (
                                  <span className="text-xs font-bold text-[#64748b] dark:text-slate-400 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> {user.email}
                                  </span>
                                )}
                                {user.phone && (
                                  <span className="text-xs font-bold text-[#64748b] dark:text-slate-400 flex items-center gap-1.5">
                                    <Phone className="w-3.5 h-3.5" /> {user.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-5 px-6 text-center">
                          {user._count?.payments > 0 ? (
                            <Badge className="bg-[#ff5722]/10 text-[#ff5722] hover:bg-[#ff5722]/20 border-none font-black px-3 py-1.5 rounded-lg text-xs gap-1.5">
                              <CreditCard className="w-3.5 h-3.5" />
                              مدفوع
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 border-none font-black px-3 py-1.5 rounded-lg text-xs">
                              مجاني
                            </Badge>
                          )}
                        </td>
                        <td className="py-5 px-6 text-center">
                          <Badge className={`text-[11px] font-black border-none px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 mx-auto w-fit ${status.class}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="py-5 px-6 text-center">
                          <span className="text-sm font-black text-[#1e293b] dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                            {user._count?.attempts ?? 0}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          <span className="text-xs font-bold text-[#94a3b8] dark:text-slate-500 flex items-center justify-end gap-2">
                            {new Date(user.createdAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}
                            <Calendar className="w-4 h-4" />
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
