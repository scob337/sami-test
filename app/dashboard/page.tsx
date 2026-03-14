
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Share2,
  BookOpen,
  Settings,
  User,
  Zap,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Target
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

  // Use test store for syncing offline results
  const { isFinished, answers, resetTest } = useTestStore()

  useEffect(() => {
    async function syncTestResults(userId: string) {
      if (!isFinished || Object.keys(answers).length === 0) return

      try {
        const response = await fetch('/api/test/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,
            userId: parseInt(userId),
            testId: 1 // Default testId
          }),
        })

        if (!response.ok) throw new Error('Failed to sync test results')
        const resultData = await response.json()

        // Generate Report
        await fetch('/api/test/generate-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attemptId: resultData.attemptId,
            testId: 1,
            userData: authUser,
            answers
          })
        })

        toast.success('تم رفع نتائج اختبارك بنجاح!')
        resetTest()

        // Refresh attempts data to show the newly synced test
        const listRes = await fetch(`/api/user/dashboard?userId=${userId}`)
        if (listRes.ok) {
          const listData = await listRes.json()
          setAttempts(listData.attempts || [])
        }

      } catch (error) {
        console.error('Error syncing offline test:', error)
        toast.error('حدث خطأ أثناء مزامنة نتائج اختبارك السابق')
      }
    }

    if (authUser && isFinished) {
      syncTestResults(authUser.id.toString())
    }
  }, [authUser, isFinished, answers, resetTest])

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
    <main className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-slate-950 text-slate-800 dark:text-slate-100" dir="rtl">
      <Header />

      {/* Top Banner Area */}
      <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 mt-16 pt-10 pb-12 w-full">
        <Container>
          <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                مرحباً بك، {authUser?.user_metadata?.fullName || dbUser?.name || 'المستخدم'}!
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                إليك ما يمكنك القيام به اليوم في منصة Sami-Test
              </p>
            </div>

            <div className="space-y-4">
              {/* Banner 1 */}
              <div className="bg-[#09344d] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between text-white shadow-md">
                <span className="font-medium text-base sm:text-lg mb-4 sm:mb-0 text-center sm:text-right">احصل على وصول كامل لمنصة الأعمال — مجاناً لمدة 7 أيام</span>
                <Button className="bg-[#10b981] hover:bg-[#059669] text-white font-bold px-8 py-6 h-auto rounded-md transition-colors text-base hidden sm:flex items-center gap-2">
                  بدء تجربة مجانية <ArrowRight className="w-5 h-5 rotate-180" />
                </Button>
              </div>

              {/* Banner 2 */}
              <div className="bg-[#09344d] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between text-white shadow-md">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mb-4 sm:mb-0">
                  <span className="font-bold text-lg">البدء في استخدام المنصة</span>
                  <span className="text-sm text-slate-300">— 2/6 مكتمل</span>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-1/3">
                  <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-[#10b981] w-1/3 rounded-full"></div>
                  </div>
                  <span className="text-slate-400 font-bold rotate-180 hidden sm:block">›</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div className="flex-1 py-12">
        <Container>
          <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-wider">البدء</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Main Card (Profile/Test) */}
              <Card className="lg:col-span-2 p-8 sm:p-12 border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-xl bg-white dark:bg-slate-900 flex flex-col items-center text-center space-y-8">
                <div className="w-full flex justify-start">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-lg">
                    <Target className="w-6 h-6" /> أكمل ملفك الشخصي
                  </div>
                </div>

                {/* Decorative Wheel/Circle placeholder */}
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-rose-100 dark:from-rose-950/40 via-amber-50 dark:via-amber-900/20 to-teal-100 dark:to-teal-950/40 border-8 border-white dark:border-slate-800 shadow-lg flex items-center justify-center relative spin-slow relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Wheel segments mockup */}
                    <div className="w-full h-px bg-white/50 dark:bg-slate-800/50 absolute rotate-45 transform origin-center"></div>
                    <div className="w-full h-px bg-white/50 dark:bg-slate-800/50 absolute -rotate-45 transform origin-center"></div>
                    <div className="w-full h-px bg-white/50 dark:bg-slate-800/50 absolute rotate-90 transform origin-center"></div>
                    <div className="w-full h-px bg-white/50 dark:bg-slate-800/50 absolute transform origin-center"></div>
                  </div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#f8f9fa] dark:bg-slate-950 shadow-inner z-10 border border-gray-100 dark:border-slate-800"></div>
                </div>

                <div className="space-y-4 max-w-lg mt-4">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">خذ اختبار الشخصية الخاص بك!</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                    ملفك الشخصي هو قلب المنصة. قم بإجراء اختبار سريع لرؤية ملفك الشخصي مليئاً بالرؤى العميقة حول شخصيتك، بالإضافة إلى نصائح للتفاعل مع الآخرين!
                  </p>
                </div>

                <Link href="/test-library" className="w-full sm:w-auto mt-4">
                  <Button className="bg-[#2ba8e0] hover:bg-[#1f8ebd] text-white px-10 py-6 h-auto rounded-md font-bold w-full shadow-md transition-colors text-lg tracking-wide uppercase">
                    ابدأ الاختبار
                  </Button>
                </Link>
              </Card>

              {/* Secondary Cards Column */}
              <div className="lg:col-span-1 flex flex-col gap-6">

                {/* Library Card */}
                <Card className="p-6 border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-xl bg-white dark:bg-slate-900 flex flex-col space-y-6">
                  <div className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200">
                    <Download className="w-5 h-5 text-slate-900 dark:text-slate-300" /> مكتبة المنصة
                  </div>
                  <div className="flex flex-col items-center justify-center py-6 bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-lg">
                    <BookOpen className="w-10 h-10 text-slate-400 mb-2" />
                    <div className="text-center">
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">متوفر في</span><br />
                      <span className="text-lg font-bold text-slate-700 dark:text-slate-300">المتجر الرقمي</span>
                    </div>
                  </div>
                  <p className="text-sm text-center text-slate-600 dark:text-slate-400 px-2 leading-relaxed">
                    تصفح الكتب المميزة واكتسب رؤى عميقة حول تطور شخصيتك!
                  </p>
                  <Link href="/test-library" className="w-full mt-auto pt-2">
                    <Button className="w-full bg-[#2ba8e0] hover:bg-[#1f8ebd] text-white py-6 h-auto rounded-md font-bold text-sm shadow-sm">
                      تصفح المتجر
                    </Button>
                  </Link>
                </Card>

                {/* Tests Results Card */}
                <Card className="p-6 border border-gray-200 dark:border-slate-800 shadow-sm dark:shadow-none rounded-xl bg-white dark:bg-slate-900 flex flex-col space-y-6">
                  <div className="flex items-center gap-3 font-bold text-slate-800 dark:text-slate-200">
                    <Calendar className="w-5 h-5 text-slate-900 dark:text-slate-300" /> اختباراتك السابقة
                  </div>
                  <div className="flex justify-center gap-6 py-6 border-b border-gray-100 dark:border-slate-800">
                    <div className="w-12 h-12 rounded bg-[#ea4335] text-white shadow-sm flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="w-12 h-12 rounded bg-[#1f8ebd] text-white shadow-sm flex items-center justify-center">
                      <Zap className="w-6 h-6" />
                    </div>
                  </div>
                  <p className="text-sm text-center text-slate-600 dark:text-slate-400 px-2 leading-relaxed">
                    راجع نتائجك السابقة بسهولة للتحضير لمرحلتك القادمة ومتابعة تطورك.
                  </p>
                  <Button variant="outline" className="w-full border-gray-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:bg-slate-950 py-6 h-auto font-semibold">
                    عرض النتائج
                  </Button>
                </Card>

              </div>
            </div>
          </div>
        </Container>
      </div>

      <Footer />

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border dark:border-slate-800 border-0 shadow-2xl rounded-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              تعديل بيانات الملف الشخصي
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">الاسم بالكامل</Label>
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="أدخل اسمك الجديد..."
                className="text-right h-12 px-4 rounded-md bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 focus:border-[#2ba8e0] font-medium"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="text-right h-12 px-4 rounded-md bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 focus:border-[#2ba8e0] font-medium"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">رقم الهاتف</Label>
                <Input
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="text-right h-12 px-4 rounded-md bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 focus:border-[#2ba8e0] font-medium"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row-reverse gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating}
              className="w-full sm:w-auto h-12 px-8 rounded-md bg-[#2ba8e0] hover:bg-[#1f8ebd] text-white font-bold shadow-sm"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>جاري الافظ...</span>
                </div>
              ) : (
                'حفظ التعديلات'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="w-full sm:w-auto h-12 px-6 rounded-md text-slate-600 dark:text-slate-300 border-gray-300 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}