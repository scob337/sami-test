'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store/auth-store'
import Link from 'next/link'
import { Download, Share2, BookOpen, Settings } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [recentTests] = useState([
    {
      id: '1',
      type: 'INFJ',
      date: '2024-03-11',
      name: 'المستشار',
    },
  ])

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Section size="lg" className="flex-1">
        <Container>
          <div className="space-y-12">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-4xl font-bold">
                مرحباً بك،{' '}
                <span className="text-primary">
                  {user?.user_metadata?.fullName || 'المستخدم'}
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                إليك ملخص نشاطك على MindMatch
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-3 gap-6"
            >
              <Card className="p-6">
                <div className="text-sm text-muted-foreground mb-2">
                  عدد الاختبارات
                </div>
                <div className="text-3xl font-bold">1</div>
              </Card>
              <Card className="p-6">
                <div className="text-sm text-muted-foreground mb-2">
                  نوع الشخصية الأساسي
                </div>
                <div className="text-3xl font-bold text-primary">INFJ</div>
              </Card>
              <Card className="p-6">
                <div className="text-sm text-muted-foreground mb-2">
                  الحالة
                </div>
                <div className="text-3xl font-bold text-accent">نشط</div>
              </Card>
            </motion.div>

            {/* Recent Tests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">الاختبارات الأخيرة</h2>
              <div className="space-y-4">
                {recentTests.length > 0 ? (
                  recentTests.map((test) => (
                    <Card key={test.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">
                            {test.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            تم في{' '}
                            {new Date(test.date).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Link href="/results">
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 ml-2" />
                              عرض التقرير
                            </Button>
                          </Link>
                          <Button size="sm" variant="outline">
                            <Share2 className="w-4 h-4 ml-2" />
                            مشاركة
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      لم تأخذ أي اختبارات بعد
                    </p>
                    <Link href="/test">
                      <Button className="bg-primary hover:bg-primary/90">
                        ابدأ الاختبار الآن
                      </Button>
                    </Link>
                  </Card>
                )}
              </div>
            </motion.div>

            {/* Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold">الموارد والكتب</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 border-primary/20">
                  <BookOpen className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold mb-2">المكتبة</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    وصول إلى مكتبة الكتب المخصصة لشخصيتك
                  </p>
                  <Link href="/books">
                    <Button size="sm" className="w-full">
                      استكشف الكتب
                    </Button>
                  </Link>
                </Card>

                <Card className="p-6 border-accent/20">
                  <Settings className="w-8 h-8 text-accent mb-4" />
                  <h3 className="font-semibold mb-2">الإعدادات</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    إدارة حسابك والتفضيلات الخاصة بك
                  </p>
                  <Link href="/settings">
                    <Button size="sm" className="w-full">
                      الإعدادات
                    </Button>
                  </Link>
                </Card>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}
