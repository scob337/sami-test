'use client'

import { useEffect, useState, Suspense, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
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

type ItemType = 'book' | 'test' | 'course'

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
  const [discountCode, setDiscountCode] = useState('')
  const [appliedDiscount, setAppliedDiscount] = useState<{ id: string, amount: number, type: string } | null>(null)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)
  const { user } = useAuthStore()

  const type = (searchParams?.get('type') || 'book') as ItemType
  const id = searchParams?.get('id')

  const finalPrice = useMemo(() => {
    if (!item) return 0
    if (!appliedDiscount) return item.price
    if (appliedDiscount.type === 'PERCENTAGE') {
      return item.price * (1 - appliedDiscount.amount / 100)
    }
    return Math.max(0, item.price - appliedDiscount.amount)
  }, [item, appliedDiscount])

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
    if (item && (window as any).Moyasar && finalPrice > 0) {
        const amount = finalPrice * 100 // Moyasar uses subunits
        const callbackUrl = `${window.location.origin}/api/payment/verify`
        
        try {
            (window as any).Moyasar.init({
                element: '.mysr-form',
                amount: Math.round(amount),
                currency: 'SAR',
                description: item.title,
                publishable_api_key: process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY,
                callback_url: callbackUrl,
                methods: ['creditcard', 'applepay', 'stcpay'],
                apple_pay: {
                    label: 'SAMI Test',
                    validate_merchant_url: 'https://api.moyasar.com/v1/applepay/initiate',
                    country: 'EG'
                },
                metadata: {
                    attemptId: id,
                    itemId: id,
                    testId: type === 'test' ? (item.data?.attempt?.testId || null) : (selectedTestId || null),
                    userId: user?.id,
                    kind: item.kind,
                    discountCodeId: appliedDiscount?.id || null
                }
            })
        } catch (err) {
            console.error('Moyasar Init Error:', err)
        }
    }
  }, [item, finalPrice, id, user, appliedDiscount])

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
            description: 'تحليل عميق لشخصيتك بناءً على إجاباتك الأخيرة.',
            data
          })
        } else if (type === 'course') {
          const res = await fetch(`/api/admin/courses/${id}`)
          if (!res.ok) throw new Error()
          const data = await res.json()
          setItem({
            kind: 'course',
            title: data.title || `كورس #${id}`,
            price: data.price || 499,
            description: data.description || 'دورة تدريبية متكاملة لتطوير مهاراتك.',
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

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return
    try {
      setIsValidatingDiscount(true)
      const res = await fetch('/api/user/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, userId: user?.id, courseId: type === 'course' ? id : null })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'كود غير صالح')
      setAppliedDiscount(data)
      toast.success('تم تطبيق الخصم بنجاح')
    } catch (error: any) {
      toast.error(error.message)
      setAppliedDiscount(null)
    } finally {
      setIsValidatingDiscount(false)
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
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#050B1A] relative overflow-hidden" dir="rtl">
      
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
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                        إتمام <span className="text-blue-500">الطلب</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl leading-relaxed">
                        أنت على بعد لحظات من الحصول على تحليلك العميق. بياناتك مشفرة وآمنة تماماً.
                    </p>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-3xl p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-slate-200 dark:border-white/[0.08] shadow-2xl shadow-black/5 dark:shadow-black/40 space-y-8 md:space-y-10">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-6 md:pb-8">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">طريقة الدفع</h3>
                    </div>
                  </div>
                  
                  {finalPrice === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          </div>
                          <div className="text-center space-y-2">
                              <h3 className="text-xl font-black text-slate-900 dark:text-white">طلب مجاني بالكامل</h3>
                              <p className="text-sm font-bold text-slate-500">تم تطبيق الخصم 100%. يمكنك إتمام الطلب مجانًا الآن.</p>
                          </div>
                          <Button
                              size="lg"
                              className="bg-emerald-500 hover:bg-emerald-600 w-full sm:w-auto px-12 h-14 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 transition-all hover:-translate-y-1"
                              disabled={isLoading}
                              onClick={async () => {
                                  try {
                                      setIsLoading(true);
                                      const res = await fetch('/api/payment/free', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                              attemptId: id,
                                              itemId: id,
                                              testId: type === 'test' ? (item.data?.attempt?.testId || null) : (selectedTestId || null),
                                              userId: user?.id,
                                              kind: item.kind,
                                              discountCodeId: appliedDiscount?.id || null
                                          })
                                      });
                                      if (!res.ok) throw new Error();
                                      const { redirectUrl } = await res.json();
                                      if (redirectUrl) router.push(redirectUrl);
                                  } catch (e) {
                                      toast.error('حدث خطأ أثناء إتمام الطلب');
                                      setIsLoading(false);
                                  }
                              }}
                          >
                              {isLoading ? <LoadingSpinner size="sm" /> : 'الحصول على الخدمة مجانًا'}
                          </Button>
                      </div>
                  ) : (
                      <div className="mysr-form min-h-[300px] w-full overflow-hidden"></div>
                  )}

                  <div className="flex items-start gap-3 md:gap-4 p-5 md:p-6 rounded-2xl md:rounded-3xl bg-blue-500/5 border border-blue-500/10 text-blue-300">
                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-xs md:text-sm font-black">حماية فائقة للبيانات</p>
                        <p className="text-[10px] md:text-xs font-bold leading-relaxed opacity-70">يتم معالجة كافة المدفوعات عبر بوابات مشفرة بمعايير عالمية.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 pb-12 lg:pb-0">
                <div className="lg:sticky lg:top-32 space-y-6">
                  <div className="bg-white/80 dark:bg-white/[0.03] backdrop-blur-3xl p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-slate-200 dark:border-white/[0.08] shadow-2xl shadow-black/5 dark:shadow-black/40 space-y-6 md:space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">ملخص الطلب</h2>
                        <span className="bg-blue-500/10 text-blue-500 dark:text-blue-400 px-3 py-1 rounded-full text-[10px] md:text-xs font-black">قيد التنفيذ</span>
                    </div>

                    <div className="p-4 md:p-6 rounded-2xl md:rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 space-y-4 md:space-y-6">
                      <div className="flex items-start gap-4 md:gap-5">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 shrink-0 border border-white/5">
                          {item.kind === 'test' ? <Zap className="w-6 h-6 md:w-8 md:h-8" /> : item.kind === 'course' ? <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" /> : <BookOpen className="w-6 h-6 md:w-8 md:h-8" />}
                        </div>
                        <div className="space-y-1 pt-1">
                          <div className="font-black text-base md:text-lg text-slate-900 dark:text-white leading-tight">{item.title}</div>
                          <div className="text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
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
                                    ? "border-blue-500 bg-blue-500/10 text-blue-500 dark:text-blue-400 shadow-lg shadow-blue-500/5"
                                    : "border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10"
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

                    <div className="space-y-4 pt-4 md:pt-6 border-t border-slate-200 dark:border-white/5">
                        <label className="text-[10px] font-black text-slate-600 dark:text-slate-500 uppercase tracking-widest">كود الخصم</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                placeholder="ادخل الكود هنا..."
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                className="flex-1 h-12 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-slate-900 dark:text-white font-bold outline-none focus:border-blue-500 transition-all"
                            />
                            <Button 
                                onClick={handleApplyDiscount}
                                disabled={isValidatingDiscount || !discountCode}
                                className="h-12 px-6 bg-blue-600 rounded-xl font-black"
                            >
                                {isValidatingDiscount ? <LoadingSpinner size="sm" /> : 'تطبيق'}
                            </Button>
                        </div>
                        {appliedDiscount && (
                            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 bg-emerald-500/10 p-3 rounded-xl">
                                <span>تم تطبيق خصم: {appliedDiscount.amount}{appliedDiscount.type === 'PERCENTAGE' ? '%' : ' ر.س'}</span>
                                <button onClick={() => setAppliedDiscount(null)} className="text-white/50 hover:text-white">إلغاء</button>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3 md:space-y-4 font-bold text-slate-700 dark:text-slate-300 text-sm md:text-base">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">سعر الخدمة</span>
                        <span className={cn("text-slate-900 dark:text-white", appliedDiscount && "line-through opacity-50")}>{item.price} ر.س</span>
                      </div>
                      {appliedDiscount && (
                        <div className="flex justify-between items-center text-emerald-500 dark:text-emerald-400">
                            <span>الخصم</span>
                            <span>-{Math.round(item.price - finalPrice)} ر.س</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">الضريبة (15%)</span>
                        <span className="text-slate-900 dark:text-white">0.00 ر.س</span>
                      </div>
                      <div className="pt-4 md:pt-6 border-t border-slate-200 dark:border-white/5 flex justify-between items-center">
                        <span className="text-lg md:text-xl font-black text-slate-900 dark:text-white">الإجمالي النهائي</span>
                        <span className="text-2xl md:text-3xl font-black text-blue-500">{Math.round(finalPrice)} ر.س</span>
                      </div>
                    </div>
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