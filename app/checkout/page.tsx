'use client'

import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import {
  CreditCard,
  ShieldCheck,
  Zap,
  BookOpen,
  ChevronRight,
  Lock,
  CheckCircle2
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'

type ItemType = 'book' | 'test'

interface CheckoutItem {
  kind: ItemType
  title: string
  price: number
  description: string
  data?: any | string
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [isLoading, setIsLoading] = useState(false)
  const [item, setItem] = useState<CheckoutItem | null>(null)
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null)
  const { user } = useAuthStore()

  const type = (searchParams?.get('type') || 'book') as ItemType
  const id = searchParams?.get('id')

  const canPurchase = !!item && (item.kind === 'book' ? !!selectedTestId : true)

  useEffect(() => {
    // Load Moyasar Script
    const script = document.createElement('script')
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=fetch'
    document.head.appendChild(script)

    const moyasarScript = document.createElement('script')
    moyasarScript.src = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js'
    moyasarScript.async = true
    document.head.appendChild(moyasarScript)

    const moyasarStyle = document.createElement('link')
    moyasarStyle.rel = 'stylesheet'
    moyasarStyle.href = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css'
    document.head.appendChild(moyasarStyle)

    return () => {
      document.head.removeChild(script)
      document.head.removeChild(moyasarScript)
      document.head.removeChild(moyasarStyle)
    }
  }, [])

  useEffect(() => {
    if (item && (window as any).Moyasar) {
        const amount = item.price * 100 // Moyasar uses subunits
        const callbackUrl = `${window.location.origin}/api/payment/verify`
        
        try {
            (window as any).Moyasar.init({
                element: '.mysr-form',
                amount: amount,
                currency: 'SAR',
                description: item.title,
                publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY,
                callback_url: callbackUrl,
                methods: ['creditcard', 'applepay', 'stcpay'],
                apple_pay: {
                    label: 'SAMI Test',
                    validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
                    country: 'SA'
                },
                metadata: {
                    attemptId: id,
                    userId: user?.id,
                    kind: item.kind
                }
            })
        } catch (err) {
            console.error('Moyasar Init Error:', err)
        }
    }
  }, [item, id, user])

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
          const res = await fetch(`/api/test/result?attemptId=${id}`)

          if (!res.ok) throw new Error()

          const data = await res.json()

          setItem({
            kind: 'test',
            title: data.attempt?.test?.name || `تقرير الاختبار #${id}`,
            price: data.attempt?.test?.book?.price || 149,
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
    <main className="min-h-screen flex flex-col bg-[#050B1A] relative overflow-hidden" dir="rtl">
      <Header />
      
      {/* Premium Background Ornaments */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[5%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full" />
        <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full" />
      </div>

      <div className="flex-1 relative z-10 pt-32 pb-20">
        <Container>
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid lg:grid-cols-12 gap-8 items-start"
            >
              {/* Main Column */}
              <div className="lg:col-span-7 space-y-6 md:space-y-8">
                <div className="space-y-4 md:space-y-6">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-400 font-bold transition-all group w-fit text-sm"
                  >
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                    العودة
                  </button>
                  <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                        إتمام <span className="text-blue-500">الطلب</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-400 font-medium max-w-xl leading-relaxed">
                        أنت على بعد لحظات من الحصول على تحليلك العميق. بياناتك مشفرة وآمنة تماماً.
                    </p>
                  </div>
                </div>

                {/* Moyasar Form Card */}
                <div className="bg-white/[0.03] backdrop-blur-3xl p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-white/[0.08] shadow-2xl shadow-black/40 space-y-8 md:space-y-10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-6 md:pb-8">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-white">طريقة الدفع</h3>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="h-5 md:h-6 px-2 bg-white/10 rounded flex items-center justify-center text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">Visa</div>
                        <div className="h-5 md:h-6 px-2 bg-white/10 rounded flex items-center justify-center text-[8px] md:text-[10px] font-bold text-slate-400 uppercase">Mada</div>
                    </div>
                  </div>
                  
                  {/* Moyasar Form Container */}
                  <div className="mysr-form min-h-[300px] w-full overflow-hidden"></div>

                  <div className="flex items-start gap-3 md:gap-4 p-5 md:p-6 rounded-2xl md:rounded-3xl bg-blue-500/5 border border-blue-500/10 text-blue-300">
                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs md:text-sm font-black">حماية فائقة للبيانات</p>
                        <p className="text-[10px] md:text-xs font-bold leading-relaxed opacity-70">يتم معالجة كافة المدفوعات عبر بوابات مشفرة بمعايير عالمية. لا نقوم بتخزين أي بيانات بنكية.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Summary */}
              <div className="lg:col-span-5 pb-12 lg:pb-0">
                <div className="lg:sticky lg:top-32 space-y-6">
                  <div className="bg-white/[0.03] backdrop-blur-3xl p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-white/[0.08] shadow-2xl shadow-black/40 space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-black text-white">ملخص الطلب</h2>
                        <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[10px] md:text-xs font-black">قيد التنفيذ</span>
                    </div>

                    <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-white/[0.03] border border-white/5 space-y-4 md:space-y-6">
                      <div className="flex items-start gap-4 md:gap-5">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 shrink-0 border border-white/5">
                          {item.kind === 'test' ? <Zap className="w-6 h-6 md:w-8 md:h-8" /> : <BookOpen className="w-6 h-6 md:w-8 md:h-8" />}
                        </div>
                        <div className="space-y-1 pt-1">
                          <div className="font-black text-base md:text-lg text-white leading-tight">{item.title}</div>
                          <div className="text-[10px] md:text-xs font-bold text-slate-400 leading-relaxed line-clamp-2">
                            {item.description}
                          </div>
                        </div>
                      </div>

                      {item.kind === 'book' && item.data?.tests && (
                        <div className="space-y-3 md:space-y-4 pt-4 border-t border-white/5">
                          <label className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">اختر الاختبار المرتبط</label>
                          <div className="grid gap-2">
                            {item.data.tests.map((test: any) => (
                              <button
                                key={test.id}
                                onClick={() => setSelectedTestId(test.id)}
                                className={cn(
                                  "flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all font-bold text-xs md:text-sm",
                                  selectedTestId === test.id
                                    ? "border-blue-500 bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/5"
                                    : "border-white/5 bg-white/5 text-slate-400 hover:border-white/10"
                                )}
                              >
                                <span>{test.name}</span>
                                {selectedTestId === test.id && <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 md:space-y-4 font-bold text-slate-300 text-sm md:text-base">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">سعر الخدمة</span>
                        <span className="text-white">{item.price} ر.س</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">الضريبة (15%)</span>
                        <span className="text-white">0.00 ر.س</span>
                      </div>
                      <div className="pt-4 md:pt-6 border-t border-white/5 flex justify-between items-center">
                        <span className="text-lg md:text-xl font-black text-white">الإجمالي النهائي</span>
                        <span className="text-2xl md:text-3xl font-black text-blue-500">{item.price} ر.س</span>
                      </div>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      {[
                        'وصول فوري للتحليل الكامل',
                        'توصيات مخصصة من الذكاء الاصطناعي',
                        'دعم فني مخصص للعملاء'
                      ].map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold text-slate-400">
                          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-500" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trust Footer */}
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="flex items-center gap-8 grayscale opacity-20">
                        <div className="h-4 w-10 md:h-6 md:w-12 bg-white/20 rounded" />
                        <div className="h-4 w-10 md:h-6 md:w-12 bg-white/20 rounded" />
                        <div className="h-4 w-10 md:h-6 md:w-12 bg-white/20 rounded" />
                    </div>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-600 text-center uppercase tracking-tighter">
                        Secure 256-bit SSL encrypted checkout
                    </p>
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