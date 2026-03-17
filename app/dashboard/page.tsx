'use client'

import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth-store'
import { useTestStore } from '@/lib/store/test-store'
import Link from 'next/link'
import {
  Download,
  BookOpen,
  Settings,
  User as UserIcon,
  Zap,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  Target,
  ShoppingBag,
  Clock,
  ChevronLeft,
  Award,
  CreditCard,
  Edit3,
  ClipboardList
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

export default function DeepNavyDashboard() {
  const { user: authUser, loading } = useAuthStore()
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')

  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/')
    }
  }, [authUser, loading, router])

  const userId = authUser?.id
  const { data, isLoading: isLoadingData, mutate } = useSWR<any>(
    authUser 
      ? `/api/user/dashboard?userId=${userId}&email=${encodeURIComponent(authUser.email || '')}&phone=${encodeURIComponent(authUser.user_metadata?.phone || '')}` 
      : null,
    fetcher
  )

  const dbUser = data?.user
  const attempts = data?.attempts || []
  const books = data?.books || []

  // Memoized Stats
  const userStats = useMemo(() => {
    return [
      { label: 'الاختبارات', value: attempts.length, icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-400/10' },
      { label: 'الكتب الرقمية', value: books.length, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
      { label: 'التقارير السابقة', value: attempts.filter((a:any) => a.reportGenerated).length, icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ]
  }, [attempts, books])

  // Callbacks for performance
  const handleOpenEdit = useCallback(() => {
    setEditName(dbUser?.name || '')
    setEditEmail(dbUser?.email || '')
    setEditPhone(dbUser?.phone || '')
    setIsEditModalOpen(true)
  }, [dbUser])

  const handleUpdateProfile = async () => {
    if (!editName.trim()) { toast.error('يرجى إدخال الاسم'); return }
    try {
      setIsUpdating(true)
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: editName, email: editEmail, phone: editPhone })
      })
      if (!res.ok) throw new Error('Update failed')
      mutate()
      toast.success('تم تحديث ملفك الشخصي')
      setIsEditModalOpen(false)
    } catch (error: any) {
      toast.error('حدث خطأ أثناء التحديث')
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading || (!authUser && !isLoadingData)) {
    return (
      <div className="min-h-screen bg-[#0A1A3B] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" className="text-blue-500" />
      </div>
    )
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-[#0A1A3B] flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" className="text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A1A3B] text-white font-sans overflow-x-hidden selection:bg-blue-500/30" dir="rtl">
      <Header />
      
      {/* Hero Header Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-[#0A1A3B] to-[#112240]">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[150px]" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-600 rounded-full blur-[150px]" />
        </div>

        <Container>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-blue-600 to-blue-400 p-1 shadow-2xl shadow-blue-500/20">
                  <div className="w-full h-full bg-[#112240] rounded-[24px] flex items-center justify-center font-black text-3xl">
                    {dbUser?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight leading-tight">
                    أهلاً بك، {dbUser?.name?.split(' ')[0]}
                  </h1>
                  <p className="text-slate-400 font-medium text-lg mt-1 italic opacity-80">
                    مستعد لاكتشاف أبعاد جديدة لشخصيتك اليوم؟
                  </p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-4"
              >
                {userStats.map((stat, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-4 rounded-3xl flex items-center gap-4 hover:border-white/20 transition-all">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-5 h-5", stat.color)} />
                    </div>
                    <div>
                      <div className="text-slate-400 text-xs font-black uppercase tracking-widest">{stat.label}</div>
                      <div className="text-xl font-black text-white">{stat.value}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-600 to-blue-500 p-8 rounded-[40px] shadow-2xl shadow-blue-500/10 w-full lg:w-[400px] relative group overflow-hidden"
            >
              <Zap className="absolute -top-4 -right-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform duration-500" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black">تحليل سريع متاح</h3>
                  <Award className="w-6 h-6 text-white/50" />
                </div>
                <p className="text-white/80 font-medium leading-relaxed">
                  لديك وصول حالي لـ {attempts.length} نماذج اختبار جديدة. ابدأ الآن للحصول على تقريرك.
                </p>
                <Link href="/test-library" className="block">
                  <Button className="w-full h-14 bg-white text-blue-600 hover:bg-slate-50 font-black text-lg rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    ابدأ اختبار جديد
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Main Content Sections */}
      <section className="pb-32 -mt-10 relative z-20">
        <Container>
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Right Column: History & Books */}
            <div className="lg:col-span-2 space-y-8">
              {/* Previous Attempts Card */}
              <div className="bg-[#112240] rounded-[40px] border border-white/5 shadow-2xl p-8 sm:p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">آخر محاولات الاختبار</h2>
                    <p className="text-slate-500 font-medium mt-1">تتبع رحلة تطور شخصيتك عبر الزمن</p>
                  </div>
                  <History className="w-8 h-8 text-blue-500/30" />
                </div>

                <div className="space-y-4">
                  {attempts.length === 0 ? (
                    <div className="py-12 flex flex-col items-center text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <Clock className="w-12 h-12 text-slate-600" />
                      <p className="text-slate-400 font-bold">لم تقم بإجراء أي اختبارات بعد</p>
                    </div>
                  ) : (
                    attempts.map((attempt: any) => (
                      <div key={attempt.id} className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 p-6 rounded-3xl transition-all flex items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-7 h-7 text-blue-400" />
                          </div>
                          <div>
                            <div className="text-lg font-black">{attempt.test?.name}</div>
                            <div className="text-sm text-slate-500 font-medium">{new Date(attempt.createdAt).toLocaleDateString('ar-SA')}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={cn("h-8 px-4 rounded-xl font-black text-xs", attempt.isPaid ? "bg-emerald-500/20 text-emerald-400 border-none" : "bg-amber-500/20 text-amber-400 border-none")}>
                            {attempt.isPaid ? 'مكتمل الدفع' : 'في انتظار الدفع'}
                          </Badge>
                          <Link href={`/results?attemptId=${attempt.id}`}>
                            <Button variant="ghost" size="icon" className="w-12 h-12 rounded-xl bg-white/5 hover:bg-blue-500 hover:text-white transition-all">
                              <ChevronLeft className="w-6 h-6" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Purchased Books Card */}
              <div className="bg-[#112240] rounded-[40px] border border-white/5 shadow-2xl p-8 sm:p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">مكتبتي الرقمية</h2>
                    <p className="text-slate-500 font-medium mt-1">الكتب والمصادر التي قمت باقتنائها</p>
                  </div>
                  <ShoppingBag className="w-8 h-8 text-purple-500/30" />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {books.length === 0 ? (
                    <div className="sm:col-span-2 py-12 flex flex-col items-center text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                      <BookOpen className="w-12 h-12 text-slate-600" />
                      <p className="text-slate-400 font-bold">لا توجد كتب مشتراة حتى الآن</p>
                      <Link href="/test-library">
                        <Button variant="link" className="text-blue-400 font-black">تصفح المتجر الآن</Button>
                      </Link>
                    </div>
                  ) : (
                    books.map((book: any) => (
                      <div key={book.id} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-purple-500/30 transition-all flex flex-col gap-5">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-20 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
                            <BookOpen className="w-8 h-8 text-purple-400" />
                          </div>
                          <div>
                            <div className="font-black text-lg line-clamp-1">{book.title}</div>
                            <div className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">نسخة رقمية (PDF)</div>
                          </div>
                        </div>
                        <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 font-bold flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          تحميل الكتاب
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Left Column: Quick Actions & Profile */}
            <div className="space-y-8">
              <Card className="bg-[#112240] border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">الملف الشخصي</h3>
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">الاسم بالكامل</div>
                      <div className="font-black text-lg text-white">{dbUser?.name}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">رقم الجوال</div>
                      <div className="font-bold text-slate-300 tracking-wider" dir="ltr">{dbUser?.phone || '---'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">البريد الإلكتروني</div>
                      <div className="font-bold text-slate-300 italic opacity-80">{dbUser?.email || 'لم يتم الربط'}</div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleOpenEdit}
                    className="w-full h-14 bg-white/5 border border-white/10 hover:bg-white text-white hover:text-[#0A1A3B] font-black text-lg rounded-2xl transition-all flex items-center gap-2"
                  >
                    <Edit3 className="w-5 h-5" />
                    تعديل البيانات
                  </Button>
                </div>
              </Card>

              {/* Support Card */}
              <div className="bg-gradient-to-br from-[#112240] to-[#1a2c4d] rounded-[40px] p-8 border border-white/5 shadow-2xl relative group cursor-pointer hover:border-blue-500/30 transition-all overflow-hidden">
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
                <div className="space-y-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                    <Settings className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <h3 className="text-xl font-black">الدعم والمساعدة</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">تواجه مشكلة في الاختبار أو تحميل التقارير؟ فريقنا متواجد لخدمتك دائماً.</p>
                  <Button variant="link" className="text-blue-400 p-0 font-black flex items-center gap-2">
                    تواصل معنا <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </Container>
      </section>

      <Footer />

      {/* Modern Redesigned Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-[#112240] border-none shadow-2xl rounded-[32px] overflow-hidden p-0" dir="rtl">
          <div className="bg-[#15283c] p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Edit3 className="w-6 h-6 text-[#ff5722]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">تطوير ملفك التعريفي</DialogTitle>
                <p className="text-white/60 font-medium mt-1">قم بتعديل بياناتك المسجلة لدينا</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الاسم الثلاثي *</Label>
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl text-white font-bold text-lg focus:ring-blue-500/50"
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الجوال</Label>
                <Input
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  dir="ltr"
                  className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl text-white font-bold text-lg focus:ring-blue-500/50 text-right"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الإيميل</Label>
                <Input
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="h-14 px-6 bg-white/5 border-white/10 rounded-2xl text-white font-bold text-lg focus:ring-blue-500/50"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-8 pt-0 flex flex-col sm:flex-row-reverse gap-4">
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-[#ff5722] hover:bg-[#e64a19] text-white font-black shadow-xl shadow-orange-500/20"
            >
              {isUpdating ? <LoadingSpinner size="sm" /> : 'تـأكيد الـتعديل'}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setIsEditModalOpen(false)}
              className="w-full sm:w-auto h-14 px-8 rounded-2xl text-slate-400 font-bold hover:bg-white/5"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function History(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" /></svg>
  )
}

function Badge({ children, className }: any) {
  return (
    <span className={cn("inline-flex items-center border p-1", className)}>
      {children}
    </span>
  )
}