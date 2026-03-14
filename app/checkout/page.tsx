'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'

import {
  CreditCard,
  ShieldCheck,
  Zap,
  BookOpen,
  ChevronRight,
  Lock,
  CheckCircle2
} from 'lucide-react'

type ItemType = 'book' | 'test'

interface CheckoutItem {
  kind: ItemType
  title: string
  price: number
  description: string
  data?: any
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [item, setItem] = useState<CheckoutItem | null>(null)
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null)

  const type = (searchParams?.get('type') || 'book') as ItemType
  const id = searchParams?.get('id')

  const canPurchase = !!item && (item.kind === 'book' ? !!selectedTestId : true)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        if (!id) {
          setItem({
            kind: 'test',
            title: 'تقرير تحليل الشخصية المتقدم',
            price: 199,
            description:
              'تقرير شامل يتضمن تحليل لنقاط القوة والضعف وتوصيات مهنية وشخصية.'
          })
          return
        }

        if (type === 'test') {
          const res = await fetch(`/api/test/report?attemptId=${id}`)

          if (!res.ok) throw new Error()

          const data = await res.json()

          setItem({
            kind: 'test',
            title: `تقرير الاختبار #${id}`,
            price: 149,
            description:
              'تحليل عميق لشخصيتك بناءً على إجاباتك الأخيرة.',
            data
          })
        } else {
          const res = await fetch(`/api/test-library?id=${id}`)

          if (!res.ok) throw new Error()

          const data = await res.json()

          setItem({
            kind: 'book',
            title: data.title || `كتاب #${id}`,
            price: data.price || 89,
            description: data.description || 'دليل شامل لتطوير الذات بناءً على أحدث الأبحاث العلمية.',
            data
          })
          
          if (data.tests && data.tests.length > 0) {
            setSelectedTestId(data.tests[0].id)
          }
        }
      } catch (error) {
        console.error(error)
        toast.error('فشل تحميل بيانات العنصر')
      }
    }

    fetchItem()
  }, [type, id])

  const handlePayment = async () => {
    if (!item) return

    try {
      setIsLoading(true)

      await new Promise((r) => setTimeout(r, 2000))

      toast.success('تم الدفع بنجاح')

      if (item.kind === 'book' && selectedTestId) {
        router.push(`/test?testId=${selectedTestId}`)
      } else {
        router.push('/results')
      }
    } catch (error) {
      toast.error('فشل عملية الدفع')
    } finally {
      setIsLoading(false)
    }
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Header />
      
      {/* Background Ornaments */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -mr-96 -mt-96" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/5 blur-[100px] rounded-full -ml-48 -mb-48" />
      </div>

      <div className="flex-1 relative z-10 pt-40 pb-20">
        <Container>
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid lg:grid-cols-12 gap-12 items-start"
            >
              {/* LEFT COLUMN */}
              <div className="lg:col-span-7 space-y-10">
                <div className="space-y-4">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary font-bold transition-colors group"
                  >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    العودة للمتجر
                  </button>
                  <h1 className="text-5xl font-black tracking-tight text-foreground">إتمام عملية الدفع</h1>
                  <p className="text-xl text-muted-foreground font-medium">أنت على بعد خطوة واحدة من الحصول على تقريرك الشامل.</p>
                </div>

                {/* Payment Form Card */}
                <div className="bg-card/40 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-border/50 shadow-2xl shadow-black/5 space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-xl font-black text-foreground">بيانات البطاقة البنكية</h3>
                    
                    <div className="grid gap-6">
                      <div className="space-y-3">
                        <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">اسم صاحب البطاقة</label>
                        <input
                          placeholder="الاسم كما هو مكتوب على البطاقة"
                          className="w-full h-16 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 focus:outline-none transition-all font-bold text-lg"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">رقم البطاقة</label>
                        <div className="relative group">
                          <input
                            placeholder="0000 0000 0000 0000"
                            className="w-full h-16 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 focus:outline-none transition-all font-bold text-lg pr-14"
                          />
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">تاريخ الانتهاء</label>
                          <input
                            placeholder="MM / YY"
                            className="w-full h-16 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 focus:outline-none transition-all font-bold text-lg"
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">رمز الأمان (CVC)</label>
                          <div className="relative group">
                            <input
                              placeholder="123"
                              className="w-full h-16 px-6 rounded-2xl bg-secondary/50 border-2 border-border/5 focus:border-primary/50 focus:outline-none transition-all font-bold text-lg pr-12"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                    <ShieldCheck className="w-6 h-6 shrink-0" />
                    <p className="text-sm font-bold leading-relaxed">بياناتك محمية بتشفير SSL عالي الأمان. نحن لا نقوم بتخزين بيانات بطاقتك.</p>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isLoading || !canPurchase}
                    className="w-full h-20 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-2xl shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري المعالجة...</span>
                      </div>
                    ) : (
                      `دفع ${item.price} ر.س`
                    )}
                  </Button>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-5">
                <div className="sticky top-40 space-y-8">
                  <div className="bg-card/40 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] border border-border/50 shadow-2xl shadow-black/5 space-y-8">
                    <h2 className="text-2xl font-black text-foreground">ملخص الطلب</h2>

                    <div className="flex items-center gap-6 p-5 rounded-3xl bg-secondary/30 border border-border/30">
                      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                        {item.kind === 'test' ? <Zap className="w-10 h-10" /> : <BookOpen className="w-10 h-10" />}
                      </div>

                      <div className="space-y-1">
                        <div className="font-black text-xl text-foreground">{item.title}</div>
                        <div className="text-sm font-bold text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </div>

                    {item.kind === 'book' && item.data?.tests && (
                      <div className="space-y-4">
                        <label className="text-sm font-black text-foreground uppercase tracking-widest mr-2">اختر الاختبار المرتبط بالكتاب</label>
                        <div className="grid gap-3">
                          {item.data.tests.map((test: any) => (
                            <button
                              key={test.id}
                              onClick={() => setSelectedTestId(test.id)}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all font-bold",
                                selectedTestId === test.id
                                  ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10"
                                  : "border-border/50 bg-background/50 text-muted-foreground hover:border-primary/30"
                              )}
                            >
                              <span>{test.name}</span>
                              {selectedTestId === test.id && <CheckCircle2 className="w-5 h-5" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4 pt-4 border-t border-border/50">
                      <div className="flex justify-between items-center text-lg font-bold text-muted-foreground">
                        <span>السعر الأساسي</span>
                        <span>{item.price} ر.س</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold text-muted-foreground">
                        <span>الضريبة (15%)</span>
                        <span>0.00 ر.س</span>
                      </div>
                      <div className="flex justify-between items-center pt-6 border-t border-border text-3xl font-black">
                        <span className="text-foreground">الإجمالي</span>
                        <span className="text-primary">{item.price} ر.س</span>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      {[
                        'وصول فوري للتقرير بعد الدفع',
                        'نسخة PDF قابلة للتحميل',
                        'دعم فني متاح 24/7'
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-3 text-base font-bold text-muted-foreground">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="flex justify-center items-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                    <div className="w-16 h-8 bg-foreground/20 rounded-md" />
                    <div className="w-16 h-8 bg-foreground/20 rounded-md" />
                    <div className="w-16 h-8 bg-foreground/20 rounded-md" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>

      <Footer />
    </main> 
  )
} 