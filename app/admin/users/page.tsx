'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Mail, Phone, Calendar, Download, Users, CreditCard, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'

interface User {
  id: number
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
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = useCallback(async (search = '') => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      if (!res.ok) throw new Error()
      setUsers(await res.json())
    } catch { toast.error('خطأ في تحميل المستخدمين') }
    finally { setIsLoading(false) }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchUsers(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm, fetchUsers])

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
          variant="outline"
          className="flex items-center gap-2 rounded-xl border-border bg-card h-11 px-5 font-semibold text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Download className="w-4 h-4" />
          تصدير CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي المستخدمين', value: users.length, icon: Users, color: 'text-primary', bg: 'bg-primary/15' },
          { label: 'دفعوا', value: paid, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-100/80' },
          { label: 'أكملوا الاختبار', value: completed, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-100/80' },
          { label: 'في منتصف الطريق', value: inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100/80' },
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
                  <tr className="bg-muted/50 border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-5">المستخدم</th>
                    <th className="py-3.5 px-5 text-center">الحالة</th>
                    <th className="py-3.5 px-5 text-center">الاختبارات</th>
                    <th className="py-3.5 px-5">تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map(user => {
                    const status = getUserStatus(user)
                    const StatusIcon = status.icon
                    return (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center text-primary font-bold text-base shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground text-sm leading-tight">{user.name}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {user.email && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {user.email}
                                  </span>
                                )}
                                {user.phone && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {user.phone}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <Badge className={`text-xs font-semibold border-0 inline-flex items-center gap-1 ${status.class}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span className="text-sm font-bold text-foreground bg-accent px-3 py-1 rounded-lg">
                            {user._count?.attempts ?? 0}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(user.createdAt).toLocaleDateString('ar-SA')}
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
