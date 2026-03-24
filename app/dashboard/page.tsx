'use client'

import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/layout/container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth-store'
import { useTestStore } from '@/lib/store/test-store'
import { useUploadStore } from '@/lib/store/upload-store'
import { supabaseClient } from '@/lib/supabase/client'
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
  ClipboardList,
  Bell as BellIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DeepNavyDashboard() {
  const { user: authUser, loading, setUser } = useAuthStore()
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const { addUpload, uploads } = useUploadStore()
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const payments = data?.payments || []
  const notifications = data?.notifications || []
  const enrolledCourses = data?.enrolledCourses || []

  // Memoized Stats
  const userStats = useMemo(() => {
    return [
      { label: 'الاختبارات', value: attempts.length, icon: ClipboardList, color: 'text-blue-400', bg: 'bg-blue-400/10' },
      { label: 'الكتب الرقمية', value: books.length, icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10' },
      { label: 'التقارير السابقة', value: attempts.filter((a: any) => a.reportGenerated).length, icon: Award, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ]
  }, [attempts, books])

  // Callbacks for performance
  const handleOpenEdit = useCallback(() => {
    setEditName(dbUser?.name || '')
    setEditEmail(dbUser?.email || '')
    setEditPhone(dbUser?.phone || '')
    setEditAvatar(dbUser?.avatarUrl || '')
    setIsEditModalOpen(true)
  }, [dbUser])

  const handleUpdateProfile = async () => {
    if (!editName.trim()) { toast.error('يرجى إدخال الاسم'); return }
    try {
      setIsUpdating(true)
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dbUserId: dbUser?.id,
          name: editName,
          email: editEmail,
          phone: editPhone,
          avatarUrl: editAvatar
        })
      })
      if (!res.ok) throw new Error('Update failed')
      
      if (authUser) {
        await supabaseClient.auth.updateUser({
          data: {
            name: editName,
            avatar_url: editAvatar
          }
        })
        setUser({
          ...authUser,
          user_metadata: {
            ...authUser.user_metadata,
            name: editName,
            avatar_url: editAvatar
          }
        })
      }

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A1A3B] text-slate-900 dark:text-white font-sans overflow-x-hidden selection:bg-blue-500/30" dir="rtl">

      {/* Hero Header Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-blue-50 to-slate-50 dark:from-[#0A1A3B] dark:to-[#112240]">
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
                <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-blue-600 to-blue-400 p-1 shadow-2xl shadow-blue-500/20 group relative overflow-hidden">
                  <div className="w-full h-full bg-slate-50 dark:bg-[#112240] rounded-[24px] flex items-center justify-center font-black text-3xl overflow-hidden">
                    {dbUser?.avatarUrl ? (
                      <img src={dbUser.avatarUrl} alt={dbUser.name} className="w-full h-full object-cover" />
                    ) : (
                      dbUser?.name?.charAt(0).toUpperCase() || 'U'
                    )}
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

              <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
                {[
                  { id: 'overview', name: 'نظرة عامة', icon: Zap },
                  { id: 'courses', name: 'دوراتي', icon: BookOpen },
                  { id: 'payments', name: 'المدفوعات', icon: CreditCard },
                  { id: 'notifications', name: 'الإشعارات', icon: BellIcon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all",
                      activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.name}
                  </button>
                ))}
              </div>
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
                  <h3 className="text-xl font-black text-white">تحليل سريع متاح</h3>
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

            {/* Tab Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Previous Attempts Card */}
                  <div className="bg-white dark:bg-[#112240] rounded-[40px] border border-slate-200 dark:border-white/5 shadow-2xl p-8 sm:p-10 space-y-8">
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
                        attempts.map((attempt: any, index: number) => (
                          <div key={`${attempt.id}-${index}`} className="group bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 p-6 rounded-3xl transition-all flex items-center justify-between gap-6">
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
                              <Badge className={cn("h-8 px-4 rounded-xl font-black text-xs", attempt.payment?.status === 'COMPLETED' ? "bg-emerald-500/20 text-emerald-400 border-none" : "bg-amber-500/20 text-amber-400 border-none")}>
                                {attempt.payment?.status === 'COMPLETED' ? 'مكتمل الدفع' : 'في انتظار الدفع'}
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
                  <div className="bg-white dark:bg-[#112240] rounded-[40px] border border-slate-200 dark:border-white/5 shadow-2xl p-8 sm:p-10 space-y-8">
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
                        books.map((book: any, index: number) => (
                          <div key={`${book.id}-${index}`} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-purple-500/30 transition-all flex flex-col gap-5">
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
              )}

              {activeTab === 'courses' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-50 dark:bg-[#112240] rounded-[40px] border border-white/5 shadow-2xl p-8 sm:p-10 space-y-8">
                    <h2 className="text-2xl font-black tracking-tight">كورساتي المشترك بها</h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {enrolledCourses.length === 0 ? (
                        <div className="sm:col-span-2 py-12 text-center text-slate-500 font-bold">لم تشترك في أي كورسات بعد</div>
                      ) : (
                        enrolledCourses.map((course: any, index: number) => (
                          <Link key={`${course.id}-${index}`} href={`/courses/${course.slug || course.id}`}>
                            <div className="bg-white/5 border border-white/5 p-4 rounded-3xl group hover:border-blue-500/30 transition-all">
                              <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                                <img src={course.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                              </div>
                              <h3 className="font-black text-lg mb-2">{course.title}</h3>
                              <Button className="w-full bg-blue-600 rounded-xl font-bold">متابعة التعلم</Button>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-50 dark:bg-[#112240] rounded-[40px] border border-white/5 shadow-2xl p-8 sm:p-10 space-y-8">
                    <h2 className="text-2xl font-black tracking-tight">سجل المدفوعات والفواتير</h2>
                    <div className="space-y-4">
                      {payments.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 font-bold">لا توجد عمليات دفع مسجلة</div>
                      ) : (
                        payments.map((p: any, index: number) => (
                          <div key={`${p.id}-${index}`} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-emerald-400" />
                              </div>
                              <div>
                                <div className="font-black">{p.course?.title || p.book?.title || 'خدمة متنوعة'}</div>
                                <div className="text-xs text-slate-500">{new Date(p.createdAt).toLocaleDateString('ar-SA')}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-black text-emerald-400">{p.amount} ر.س</div>
                              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{p.status}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="bg-slate-50 dark:bg-[#112240] rounded-[40px] border border-white/5 shadow-2xl p-8 sm:p-10 space-y-8">
                    <h2 className="text-2xl font-black tracking-tight">مركز الإشعارات</h2>
                    <div className="space-y-4">
                      {notifications.length === 0 ? (
                        <div className="py-12 text-center text-slate-500 font-bold">لا توجد إشعارات جديدة</div>
                      ) : (
                        notifications.map((n: any, index: number) => (
                          <div key={`${n.id}-${index}`} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex gap-4">
                            <div className={cn("w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center", n.notification?.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400')}>
                              <BellIcon className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-black">{n.notification?.title}</h4>
                              <p className="text-sm text-slate-400 font-medium leading-relaxed">{n.notification?.content}</p>
                              <div className="text-[10px] text-slate-600 font-bold mt-2">{new Date(n.createdAt).toLocaleDateString('ar-SA')}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Left Column: Quick Actions & Profile */}
            <div className="space-y-8">
              <Card className="bg-slate-50 dark:bg-[#112240] border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8 overflow-hidden relative">
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
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-[2px]">الاسم بالكامل</div>
                      <div className="font-black text-lg dark:text-slate-500">{dbUser?.name}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">رقم الجوال</div>
                      <div className="font-bold dark:text-slate-300 tracking-wider" dir="ltr">{dbUser?.phone || '---'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[2px]">البريد الإلكتروني</div>
                      <div className="font-bold text-slate-700 dark:text-slate-300 italic opacity-80">{dbUser?.email || 'لم يتم الربط'}</div>
                    </div>
                  </div>

                  <Button
                    onClick={handleOpenEdit}
                    className="w-full h-14 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white text-slate-900 dark:text-white dark:hover:text-[#0A1A3B] font-black text-lg rounded-2xl transition-all flex items-center gap-2"
                  >
                    <Edit3 className="w-5 h-5" />
                    تعديل البيانات
                  </Button>
                </div>
              </Card>

            </div>

          </div>
        </Container>
      </section>


      {/* Modern Redesigned Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#112240] border-none shadow-2xl rounded-[32px] overflow-hidden p-0" dir="rtl">
          <div className="bg-slate-50 dark:bg-[#15283c] p-8 text-slate-900 dark:text-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Edit3 className="w-6 h-6 text-[#ff5722]" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">تطوير ملفك التعريفي</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-white/60 font-medium mt-1">قم بتعديل بياناتك المسجلة لدينا</DialogDescription>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الاسم الثلاثي *</Label>
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="h-14 px-6 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold text-lg focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الصورة الشخصية</Label>
              <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-white/10 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-white/10">
                  {editAvatar ? (
                    <img src={editAvatar} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        setIsUpdating(true)
                        const formData = new FormData()
                        formData.append('file', file)
                        formData.append('bucket', 'avatars')
                        const res = await fetch('/api/user/upload', {
                          method: 'POST',
                          body: formData
                        })
                        if (!res.ok) throw new Error('Upload failed')
                        const data = await res.json()
                        setEditAvatar(data.url)
                        toast.success('تم رفع الصورة بنجاح')
                      } catch (err) {
                        toast.error('فشل رفع الصورة')
                      } finally {
                        setIsUpdating(false)
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    تغيير الصورة
                  </Button>
                  <p className="text-[10px] text-slate-500">JPG, PNG أو GIF. بحد أقصى 2MB.</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الجوال</Label>
                <Input
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  dir="ltr"
                  className="h-14 px-6 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold text-lg focus:ring-blue-500/50 text-right"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">الإيميل</Label>
                <Input
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="h-14 px-6 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white font-bold text-lg focus:ring-blue-500/50"
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