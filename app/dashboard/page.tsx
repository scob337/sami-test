
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth-store'
import Link from 'next/link'
import {
  Download,
  Share2,
  BookOpen,
  Settings,
  User,
  Zap,
  Calendar,
  CheckCircle2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const recentTests = [
  {
    id: '1',
    type: 'INFJ',
    date: '2024-03-11',
    name: 'المستشار',
    status: 'مكتمل',
    score: '92%'
  }
]

export default function DashboardPage() {
  const { user: authUser } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // If no auth user in client store, treat as unauthenticated and redirect to homepage
    if (!authUser) {
      router.replace('/')
    }
  }, [authUser, router])
  const [dbUser, setDbUser] = useState<any>(null)
  const [attempts, setAttempts] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsEditUpdating] = useState(false)
  
  // Edit Form State
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')

  useEffect(() => {
    async function fetchDashboardData() {
      // In a real app, you'd get the DB userId from the auth session or a mapping
      // For now, we'll use a placeholder or the ID if it's numeric
      const userId = authUser?.id || '1' 
      
      try {
        const res = await fetch(`/api/user/dashboard?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setDbUser(data.user)
          setAttempts(data.attempts || [])
          setBooks(data.books || [])
          
          // Pre-fill edit form
          setEditName(data.user?.name || '')
          setEditEmail(data.user?.email || '')
          setEditPhone(data.user?.phone || '')
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [authUser?.id])

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      toast.error('يرجى إدخال الاسم')
      return
    }

    try {
      setIsEditUpdating(true)
      const userId = authUser?.id || '1'
      
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: editName,
          email: editEmail,
          phone: editPhone,
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Update failed')
      }

      const updatedUser = await res.json()
      setDbUser(updatedUser)
      toast.success('تم تحديث البيانات بنجاح')
      setIsEditModalOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء التحديث')
    } finally {
      setIsEditUpdating(false)
    }
  }

  const latestResult = attempts[0]?.result

  const stats = [
    {
      label: 'إجمالي الاختبارات',
      value: attempts.length.toString(),
      icon: BookOpen,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      label: 'الكتب المشتراة',
      value: books.length.toString(),
      icon: Download,
      color: 'text-accent-foreground',
      bg: 'bg-accent/20'
    },
    {
      label: 'مستوى النشاط',
      value: attempts.length > 0 ? 'نشط' : 'غير نشط',
      icon: Zap,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      label: 'عضو منذ',
      value: dbUser ? new Date(dbUser.createdAt).getFullYear().toString() : '---',
      icon: Calendar,
      color: 'text-accent-foreground',
      bg: 'bg-accent/20'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Header />

      <div className="flex-1 pt-24 pb-16">
        <Container>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-6xl mx-auto space-y-12"
          >
            {/* Dashboard Header */}
            <motion.div variants={itemVariants} className="space-y-6 text-center md:text-right">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                    مرحباً بك{' '}
                    <span className="bg-gradient-to-l from-primary to-accent-foreground bg-clip-text text-transparent">
                      {authUser?.user_metadata?.fullName ?? 'المستخدم'}
                    </span>
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-2xl">
                    إليك نظرة شاملة على رحلتك في اكتشاف الذات وتطور شخصيتك.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center md:justify-end gap-3">
                  <Link href="/test-library">
                    <Button
                      className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                      بدء اختبار جديد
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-1 border-none bg-card/40 backdrop-blur-xl shadow-xl hover:bg-card/60 transition-all group overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn("p-3 rounded-2xl shadow-inner group-hover:scale-110 transition-transform", stat.bg)}>
                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl md:text-3xl font-black text-foreground">{stat.value}</div>
                      <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </motion.div>

            {/* Profile and Books Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6 order-2 lg:order-1">
                <h2 className="text-2xl font-black tracking-tight mr-2 text-center lg:text-right">ملفي الشخصي</h2>
                <Card className="p-6 md:p-8 border-none bg-card/40 backdrop-blur-xl shadow-xl space-y-8">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/20 shadow-xl shadow-primary/5">
                      <User className="w-10 h-10 md:w-12 md:h-12" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl md:text-2xl font-black text-foreground">{dbUser?.name || authUser?.user_metadata?.fullName || 'المستخدم'}</h3>
                      <p className="text-sm md:text-base text-muted-foreground font-bold break-all">{dbUser?.email || authUser?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-muted-foreground font-bold text-sm md:text-base shrink-0">رقم الهاتف</span>
                      <span className="text-foreground font-black text-sm md:text-base truncate" dir="ltr">{dbUser?.phone || '---'}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-muted-foreground font-bold text-sm md:text-base shrink-0">تاريخ التسجيل</span>
                      <span className="text-foreground font-black text-sm md:text-base truncate">
                        {dbUser ? new Date(dbUser.createdAt).toLocaleDateString('ar-SA') : '---'}
                      </span>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full h-12 rounded-xl border-border font-bold hover:bg-secondary transition-all"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    تعديل البيانات
                  </Button>
                </Card>
              </motion.div>

              {/* My Books Section */}
              <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6 order-1 lg:order-2">
                <div className="flex items-center justify-between mr-2">
                  <h2 className="text-2xl font-black tracking-tight">كتبي المشتراة</h2>
                  <Link href="/test-library">
                    <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-xl px-4 py-2 text-sm md:text-base">تصفح المتجر</Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {books.length > 0 ? (
                    books.map((book) => (
                      <Card key={book.id} className="p-4 md:p-6 border-none bg-card/40 backdrop-blur-xl shadow-xl hover:bg-card/60 transition-all group overflow-hidden">
                        <div className="flex gap-4">
                          <div className="w-14 h-18 md:w-16 md:h-20 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                            <BookOpen className="w-7 h-7 md:w-8 md:h-8" />
                          </div>
                          <div className="space-y-2 flex-1 min-w-0">
                            <h3 className="font-black text-foreground text-sm md:text-base truncate group-hover:text-primary transition-colors">{book.title}</h3>
                            <p className="text-[10px] md:text-xs text-muted-foreground font-bold line-clamp-2 leading-relaxed">{book.description}</p>
                            <a 
                              href={book.filePdf} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] md:text-xs font-black text-primary hover:underline mt-1"
                            >
                              <Download className="w-3 h-3" />
                              تحميل النسخة
                            </a>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center bg-card/20 rounded-[2rem] border-2 border-dashed border-border/50">
                      <p className="text-muted-foreground font-bold">لم تقم بشراء أي كتب بعد</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Recent Tests Section */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-center sm:text-right">
                  آخر الاختبارات المكتملة
                </h2>

                <Button
                  variant="ghost"
                  className="text-primary font-bold hover:bg-primary/10 rounded-xl h-12 px-4 md:px-6 w-fit mx-auto sm:mx-0"
                >
                  عرض الكل
                </Button>
              </div>

              <div className="grid gap-6">
                {attempts.length > 0 ? (
                  attempts.map((attempt) => (
                    <Card
                      key={attempt.id}
                      className="p-1 border-none bg-card/40 backdrop-blur-xl shadow-xl hover:bg-card/60 transition-all group overflow-hidden"
                    >
                      <div className="p-4 md:p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 md:gap-8">
                        {/* Test Info */}
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center text-primary font-black text-xl md:text-2xl shadow-inner group-hover:scale-105 transition-transform shrink-0">
                            {attempt.result?.primaryPattern?.[0] || 'T'}
                          </div>

                          <div className="space-y-1 md:space-y-2">
                            <h3 className="font-black text-xl md:text-2xl group-hover:text-primary transition-colors">
                              نمط {attempt.result?.primaryPattern || 'غير معروف'}
                            </h3>

                            <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm font-bold text-muted-foreground">
                              <span className="flex items-center gap-1.5 bg-background/50 px-2 py-0.5 rounded-lg border border-border/50">
                                <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                {new Date(attempt.completedAt).toLocaleDateString('ar-SA')}
                              </span>

                              <span className="hidden sm:block w-1.5 h-1.5 rounded-full bg-border" />

                              <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-lg border border-emerald-500/10">
                                <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                {attempt.status === 'COMPLETED' ? 'مكتمل' : 'قيد التقدم'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                          <div className="flex items-center justify-between lg:justify-end w-full sm:w-auto lg:ml-4 bg-secondary/30 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
                            <div className="text-right">
                              <div className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                دقة التحليل
                              </div>
                              <div className="text-xl md:text-2xl font-black text-foreground">
                                98%
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
                            <Link href={`/results?attemptId=${attempt.id}`} className="flex-1 sm:flex-none">
                              <Button
                                size="lg"
                                className="h-12 md:h-14 px-6 md:px-8 rounded-xl md:rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm md:text-base shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 w-full"
                              >
                                عرض التقرير
                              </Button>
                            </Link>

                            <Button
                              size="lg"
                              variant="outline"
                              className="h-12 w-12 md:h-14 md:w-14 p-0 rounded-xl md:rounded-2xl border-2 hover:bg-secondary transition-all shrink-0"
                            >
                              <Download className="w-5 h-5 md:w-6 md:h-6" />
                            </Button>

                            <Button
                              size="lg"
                              variant="outline"
                              className="h-12 w-12 md:h-14 md:w-14 p-0 rounded-xl md:rounded-2xl border-2 hover:bg-secondary transition-all shrink-0"
                            >
                              <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-20 bg-secondary/20 rounded-[3rem] border-2 border-dashed border-border">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />

                    <p className="text-xl font-bold text-muted-foreground">
                      لا توجد اختبارات مكتملة بعد
                    </p>

                    <Link href="/test">
                      <Button className="mt-8 h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 font-black shadow-xl shadow-primary/20">
                        ابدأ اختبارك الأول
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </div>

      <Footer />

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border rounded-3xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
              تعديل بيانات الملف الشخصي
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">الاسم بالكامل</Label>
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="أدخل اسمك الجديد..."
                className="text-right h-14 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold text-lg transition-all"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="text-right h-14 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold text-lg transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">رقم الهاتف</Label>
                <Input
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="text-right h-14 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 font-bold text-lg transition-all"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row-reverse gap-4 pt-4">
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              {isUpdating ? (
                <div className="flex items-center gap-3">
                  <LoadingSpinner size="sm" />
                  <span>جاري الحفظ...</span>
                </div>
              ) : (
                'حفظ التعديلات'
              )}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsEditModalOpen(false)} 
              className="w-full sm:w-auto h-14 px-8 rounded-2xl text-muted-foreground font-bold hover:bg-secondary"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}