
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
  const { user } = useAuthStore()
  const [attempts, setAttempts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.id) return
      try {
        const res = await fetch(`/api/user/dashboard?userId=${user.id}`)
        if (res.ok) {
          const data = await res.json()
          setAttempts(data.attempts || [])
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [user?.id])

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
      label: 'نوع الشخصية',
      value: latestResult?.primaryPattern || '---',
      icon: User,
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
      label: 'آخر تحديث',
      value: attempts[0] ? new Date(attempts[0].completedAt).toLocaleDateString('ar-SA') : '---',
      icon: Settings,
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
            className="space-y-12"
          >
            {/* Welcome */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold">
                لوحة التحكم الشخصية
              </div>

              <h1 className="text-5xl md:text-6xl font-black tracking-tight">
                مرحباً بك{' '}
                <span className="bg-gradient-to-l from-primary to-accent-foreground bg-clip-text text-transparent">
                  {user?.user_metadata?.fullName ?? 'المستخدم'}
                </span>
              </h1>

              <p className="text-xl text-muted-foreground font-medium max-w-2xl">
                إليك نظرة شاملة على رحلتك في اكتشاف الذات وتطور شخصيتك.
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {stats.map((stat) => {
                const Icon = stat.icon

                return (
                  <Card
                    key={stat.label}
                    className="p-8 border-none bg-card/40 backdrop-blur-xl shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={cn(
                          'p-4 rounded-2xl transition-transform group-hover:scale-110',
                          stat.bg,
                          stat.color
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                        {stat.label}
                      </div>

                      <div className="text-3xl font-black">
                        {stat.value}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </motion.div>

            {/* Recent Tests */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black tracking-tight">
                  آخر الاختبارات المكتملة
                </h2>

                <div className="flex gap-4">
                  <Button
                    className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    حفظ التعديلات
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-primary font-bold hover:bg-primary/10 rounded-xl h-12 px-6"
                  >
                    عرض الكل
                  </Button>
                </div>
              </div>

              <div className="grid gap-6">
                {attempts.length > 0 ? (
                  attempts.map((attempt) => (
                    <Card
                      key={attempt.id}
                      className="p-1 border-none bg-card/40 backdrop-blur-xl shadow-xl hover:bg-card/60 transition-all group overflow-hidden"
                    >
                      <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                        {/* Test Info */}
                        <div className="flex items-center gap-6">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-indigo-500/20 flex items-center justify-center text-primary font-black text-2xl shadow-inner group-hover:scale-105 transition-transform">
                            {attempt.result?.primaryPattern?.[0] || 'T'}
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-black text-2xl group-hover:text-primary transition-colors">
                              نمط {attempt.result?.primaryPattern || 'غير معروف'}
                            </h3>

                            <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {new Date(attempt.completedAt).toLocaleDateString('ar-SA')}
                              </span>

                              <span className="w-1.5 h-1.5 rounded-full bg-border" />

                              <span className="flex items-center gap-1.5 text-emerald-500">
                                <CheckCircle2 className="w-4 h-4" />
                                {attempt.status === 'COMPLETED' ? 'مكتمل' : 'قيد التقدم'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                          <div className="text-left md:text-right ml-4">
                            <div className="text-sm font-bold text-muted-foreground">
                              دقة التحليل
                            </div>

                            <div className="text-2xl font-black text-foreground">
                              98%
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Link href={`/results?attemptId=${attempt.id}`}>
                              <Button
                                size="lg"
                                className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                              >
                                عرض التقرير
                              </Button>
                            </Link>

                            <Button
                              size="lg"
                              variant="outline"
                              className="h-14 w-14 p-0 rounded-2xl border-2 hover:bg-secondary transition-all"
                            >
                              <Download className="w-6 h-6" />
                            </Button>

                            <Button
                              size="lg"
                              variant="outline"
                              className="h-14 w-14 p-0 rounded-2xl border-2 hover:bg-secondary transition-all"
                            >
                              <Share2 className="w-6 h-6" />
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
    </main>
  )
}