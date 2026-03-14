'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { useTestStore } from '@/lib/store/test-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'
import { Share2, Download, ArrowRight, Zap, Shield, Brain, BookOpen, BarChart3, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useMemo, useEffect, useState } from 'react'

const PERSONALITY_TYPES = [
  { code: 'ASSERTIVE', name: 'الحازم', description: 'قائد طبيعي ومبادر، يمتلك رؤية واضحة وقدرة على اتخاذ القرارات الصعبة.', icon: Zap },
  { code: 'PRECISE', name: 'المدقق', description: 'منظم ويهتم بالتفاصيل، يسعى دائماً للإتقان والجودة في كل عمل.', icon: Shield },
  { code: 'CALM', name: 'الهادئ', description: 'هادئ ومتزن ومستمع جيد، يفضل الاستقرار والانسجام في محيطه.', icon: Brain },
  { code: 'WISE', name: 'الحكيم', description: 'عميق التفكير ورزين، يمتلك بصيرة نافذة وقدرة على فهم الأمور بعمق.', icon: BookOpen },
  { code: 'SPONTANEOUS', name: 'العفوي', description: 'مبدع، حيوي ومحب للمغامرة، يكره الروتين ويبحث دائماً عن التجديد.', icon: Zap },
  { code: 'OPEN', name: 'المنفتح', description: 'اجتماعي وودود بجاذبية طبيعية، يستمتع بالتواصل مع الآخرين وبناء العلاقات.', icon: Share2 },
  { code: 'THINKER', name: 'المفكر', description: 'تحليلي ومنطقي، يعتمد على البيانات والعقل في اتخاذ قراراته وفهم الحياة.', icon: BarChart3 },
]

export default function ResultsPage() {
  const router = useRouter()
  const { result, resetTest } = useTestStore()
  const [report, setReport] = useState<string | null>(null)

  useEffect(() => {
    if (result?.attemptId) {
      const fetchReport = async () => {
        try {
          const res = await fetch(`/api/test/report?attemptId=${result.attemptId}`)
          if (res.ok) {
            const data = await res.json()
            setReport(data.reportText)
          }
        } catch (error) {
          console.error('Error fetching report:', error)
        }
      }
      fetchReport()
    }
  }, [result?.attemptId])

  const currentType = useMemo(() => {
    if (!result) return PERSONALITY_TYPES[0]
    return PERSONALITY_TYPES.find(
      (t) => t.code === (result.primaryPattern || '').toUpperCase()
    ) || PERSONALITY_TYPES[0]
  }, [result?.primaryPattern])

  const sortedScores = useMemo(() => {
    if (!result?.scores) return []
    return Object.entries(result.scores)
      .sort(([, a], [, b]) => b - a)
  }, [result?.scores])

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'نتائج اختبار شخصيتي',
          text: `أنا من نوع ${currentType.name}! اكتشف نوع شخصيتك على Sami-Test`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(
          `أنا من نوع ${currentType.name}! اكتشف نوع شخصيتك على Sami-Test\n${window.location.href}`
        )
        toast.success('تم نسخ الرابط')
      }
    } catch (error) {
      toast.error('فشل المشاركة')
    }
  }

  return (
    <main className="min-h-screen flex flex-col relative pt-20">
      <Header />

      <Section size="lg" className="flex-1 overflow-hidden relative">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />

        <Container size="md">
          <div className="max-w-4xl mx-auto space-y-16 relative z-10">
            {/* Result Header */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-8"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 primary-gradient blur-3xl opacity-20 animate-pulse" />
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] primary-gradient p-1 flex items-center justify-center transform rotate-3 shadow-2xl">
                  <div className="w-full h-full bg-background rounded-[2.3rem] flex items-center justify-center text-foreground font-black text-5xl md:text-6xl -rotate-3">
                    {(result.primaryPattern || '??').slice(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-7xl font-black tracking-tight"
                >
                  أنت <span className="primary-gradient bg-clip-text text-transparent">{currentType.name}</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto"
                >
                  {currentType.description}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card border border-border p-6 sm:p-8 md:p-12 rounded-2xl md:rounded-[3rem] shadow-xl text-lg md:text-xl text-foreground leading-relaxed text-right font-medium italic"
              >
                "{result.summary_ar}"
              </motion.div>
            </motion.div>

            {/* Scores & Analysis Grid */}
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Detailed Scores - Gated */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className={`lg:col-span-3 bg-card border border-border p-6 sm:p-8 md:p-10 rounded-2xl md:rounded-[3rem] shadow-lg relative overflow-hidden ${!result.hasPaid ? 'min-h-[400px]' : ''}`}
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">تحليل الأنماط التفصيلي</h2>
                </div>

                <div className={`space-y-8 ${!result.hasPaid ? 'blur-md select-none pointer-events-none' : ''}`}>
                  {(result.hasPaid ? sortedScores : sortedScores.slice(0, 3)).map(([type, score], index) => {
                    const typeInfo = PERSONALITY_TYPES.find(t => t.code === type) || { name: type, icon: Brain }
                    const Icon = typeInfo.icon
                    return (
                      <div key={type} className="group cursor-default">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <span className="font-bold text-foreground/80 group-hover:text-foreground transition-colors">{typeInfo.name}</span>
                          </div>
                          <span className="text-xl font-black text-primary">
                            {score}%
                          </span>
                        </div>
                        <div className="h-4 w-full bg-muted rounded-full overflow-hidden border border-border p-1">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1, delay: 0.8 + index * 0.1, ease: "easeOut" }}
                            className="h-full primary-gradient rounded-full shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {!result.hasPaid && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-card/95 backdrop-blur-sm">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-bounce">
                      <Zap className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-4">افتح التحليل الكامل</h3>
                    <p className="text-muted-foreground font-medium max-w-xs mb-8">
                      اشترك الآن لتتمكن من رؤية التوزيع الدقيق لأنماط شخصيتك والتحليل النفسي العميق.
                    </p>
                    <Link href="/checkout">
                      <Button size="lg" className="rounded-2xl px-10 h-14 bg-primary hover:bg-primary/80 text-primary-foreground font-bold shadow-xl shadow-primary/20 cursor-pointer">
                        ترقية للحصول على التقرير
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>

              {/* Quick Actions & Premium */}
              <div className="lg:col-span-2 space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-6 sm:p-8 rounded-2xl md:rounded-[2.5rem] border border-primary/20 bg-primary/5 shadow-lg overflow-hidden relative group"
                >
                  <div className="relative z-10 space-y-6">
                    <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
                      <Zap className="w-6 h-6 text-primary fill-primary" />
                      التقرير الشامل
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">
                      {result.hasPaid
                        ? 'شكراً لثقتك! يمكنك الآن قراءة التحليل المفصل الذي أعده الخبراء بناءً على إجاباتك.'
                        : 'احصل على التقرير الكامل المكون من 20 صفحة لتحليل عميق لكل جوانب حياتك وتوصيات عملية من الخبراء.'}
                    </p>
                    {result.hasPaid ? (
                      <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 rounded-2xl shadow-lg shadow-green-500/20 transition-all hover:scale-[1.01] cursor-pointer">
                        <Download className="w-5 h-5 ml-2" />
                        تحميل التقرير (PDF)
                      </Button>
                    ) : (
                      <Link href="/checkout" className="block w-full">
                        <Button size="lg" className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold h-14 rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] cursor-pointer">
                          عرض التقرير المفصل
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.div>

                {/* Expert Report Section */}
                {result.hasPaid && report && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="p-8 md:p-10 rounded-3xl border border-border bg-card shadow-sm lg:col-span-5"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">التقرير التحليلي المفصل</h2>
                    </div>
                    <div className="text-lg text-foreground/90 leading-loose whitespace-pre-wrap text-right font-medium">
                      {report}
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => router.push('/test-library')}
                  className="bg-card border border-border p-6 sm:p-8 rounded-2xl md:rounded-[3rem] shadow-lg group cursor-pointer hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-accent flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform">
                      <BookOpen className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-foreground mb-1">الكتب المقترحة</h4>
                      <p className="text-sm text-muted-foreground font-medium">موارد مختارة بعناية لنوع شخصيتك</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex flex-col gap-4"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="h-14 rounded-2xl border-border bg-secondary hover:bg-muted text-foreground font-bold transition-all hover:-translate-y-1 cursor-pointer"
                  >
                    <Share2 className="w-5 h-5 ml-2" />
                    مشاركة النتيجة
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => {
                      resetTest();
                      router.push('/');
                    }}
                    className="h-14 rounded-2xl text-muted-foreground hover:text-foreground transition-all font-bold"
                  >
                    العودة للرئيسية وإعادة الاختبار
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Subscription Upsell */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative p-1 rounded-[3rem] primary-gradient shadow-2xl shadow-primary/20"
            >
              <div className="bg-background rounded-[2.9rem] p-10 md:p-16 text-center space-y-8 overflow-hidden relative">
                {/* Decorative mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary),0.1),transparent)] opacity-50" />

                <div className="relative z-10 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm tracking-widest uppercase">
                    باقة النخبة
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight">
                    استثمر في مستقبلك اليوم
                  </h2>
                  <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                    انضم إلى أكثر من 10,000 مستخدم حصلوا على تقاريرهم الاحترافية ونجحوا في تطوير مساراتهم العملية والشخصية.
                  </p>
                  <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest font-bold">تقرير كامل</p>
                      <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest font-bold">كل الكتب</p>
                      <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1 uppercase tracking-widest font-bold">دعم 24/7</p>
                      <div className="w-12 h-1 bg-primary mx-auto rounded-full" />
                    </div>
                  </div>
                  <div className="pt-6">
                    <Link href="/checkout">
                      <Button size="lg" className="h-16 px-12 bg-primary hover:bg-primary/80 text-primary-foreground font-black text-xl rounded-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                        احصل على تقريرك الاحترافي الآن
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}
