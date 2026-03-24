'use client'

import { useEffect, useState, Suspense, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  CreditCard,
  Zap,
  BookOpen,
  ChevronRight,
  Lock,
  CheckCircle2,
  Star
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { CustomPaymentForm } from '@/components/checkout/custom-payment-form'

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
      <div className="min-h-screen flex items-center justify-center bg-[#050B1A]">
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

  const handleApplyDiscount = async (codeOverride?: string) => {
    const codeToUse = codeOverride !== undefined ? codeOverride : discountCode
    if (!codeToUse.trim()) return
    try {
      setIsValidatingDiscount(true)
      const res = await fetch('/api/user/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToUse, userId: user?.id, courseId: type === 'course' ? id : null })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'كود غير صالح')
      setAppliedDiscount(data)
      toast.success('تم تطبيق الخصم بنجاح')
    } catch (error: any) {
      // Don't toast for auto-validation unless specifically requested, or keep it quiet
      if (codeOverride === undefined) toast.error(error.message)
      setAppliedDiscount(null)
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  // Auto-apply discount code
  useEffect(() => {
    const timer = setTimeout(() => {
        if (discountCode.length >= 3 && !appliedDiscount) {
            handleApplyDiscount(discountCode)
        }
    }, 800)
    return () => clearTimeout(timer)
  }, [discountCode])

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050B1A]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }


  return (
    <main className="min-h-screen flex flex-col bg-[#050B1A] font-cairo" dir="rtl">
      <div className="flex-1 py-12 px-4 md:py-20 flex flex-col items-center">
        {/* Progress Bar Component */}
        <div className="w-full max-w-[480px] mb-12 flex items-center justify-between px-2">
            <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-black text-lg shadow-lg shadow-amber-500/30 transition-transform hover:scale-110">2</div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[10px] text-amber-500 font-black tracking-widest uppercase whitespace-nowrap">الدفع</div>
            </div>
            <div className="flex-1 h-1.5 mx-4 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                />
            </div>
            <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-500/50 font-black text-lg">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-black tracking-widest uppercase opacity-50">التقرير</div>
            </div>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">إتمام الطلب</h1>
            <p className="text-slate-400 font-bold text-lg md:text-xl italic max-w-2xl mx-auto">
                مرحباً <span className="text-amber-500">{user?.name?.split(' ')[0] || 'Sam'}</span>! أنت على بعد خطوة واحدة من الحصول على تقريرك.
            </p>
        </div>

        {/* Promo Code Section (Moved to Top) */}
        <div className="mb-8 w-full max-w-[580px] p-2 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-3 items-center">
            <input 
                type="text"
                placeholder="هل لديك كود خصم؟"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className="flex-1 h-14 bg-transparent border-none px-6 text-white font-bold outline-none placeholder:text-slate-600 focus:ring-0 transition-all"
            />
            <Button 
                onClick={() => handleApplyDiscount()}
                disabled={isValidatingDiscount || !discountCode}
                className="h-14 px-10 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black border border-white/10 transition-all hover:border-amber-500/50 active:scale-95"
            >
                {isValidatingDiscount ? <LoadingSpinner size="sm" /> : 'تطبيق'}
            </Button>
        </div>

        {/* Main Checkout Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[580px] bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[48px] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] space-y-10 relative overflow-hidden"
        >
          {/* Decorative Corner Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Item Details Summary Section */}
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                {item.kind === 'test' ? <Zap className="w-8 h-8 text-amber-500" /> : <BookOpen className="w-8 h-8 text-amber-500" />}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-white">{item.title}</h3>
                <p className="text-sm font-bold text-slate-400 line-clamp-1">{item.description}</p>
              </div>
            </div>
            <div className="h-px bg-white/5 w-full" />
            <div className="flex justify-between items-center text-sm font-bold">
               <span className="text-slate-400">سعر المنتج</span>
               <span className="text-white">{item.price} ر.س</span>
            </div>
            {appliedDiscount && (
              <div className="flex justify-between items-center text-sm font-bold text-emerald-500">
                <span>خصم ({appliedDiscount.id})</span>
                <span>-{item.price - finalPrice} ر.س</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xl font-black text-amber-500 pt-2 border-t border-white/5 mt-2">
               <span>المجموع النهائي</span>
               <span>{Math.round(finalPrice)} ر.س</span>
            </div>
          </div>

          {!user ? (
              <div className="flex flex-col items-center justify-center p-10 space-y-6 bg-white/5 rounded-[32px] border border-white/10 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center border border-white/5">
                    <Lock className="w-10 h-10 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                      <h3 className="text-2xl font-black text-white">تسجيل الدخول مطلوب</h3>
                      <p className="text-base font-bold text-slate-400 max-w-[280px]">سجل دخولك أو أنشئ حساباً جديداً لإتمام عملية الدفع والوصول لتقريرك.</p>
                  </div>
                  <Button
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto px-12 h-16 rounded-2xl font-black text-xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                      onClick={() => {
                          const currentUrl = encodeURIComponent(window.location.pathname + window.location.search);
                          router.push(`/auth/login?redirect=${currentUrl}`);
                      }}
                  >
                      تسجيل الدخول الآن
                  </Button>
              </div>
          ) : finalPrice === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-emerald-500/5 border border-emerald-500/20 rounded-[32px]">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 animate-pulse">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                  </div>
                  <div className="text-center space-y-2">
                      <h3 className="text-2xl font-black text-white">طلب مجاني بالكامل</h3>
                      <p className="text-base font-bold text-slate-400">تم تطبيق الخصم 100%. يمكنك الحصول على التقرير فوراً.</p>
                  </div>
                  <Button
                      size="lg"
                      className="bg-emerald-500 hover:bg-emerald-600 w-full px-12 h-16 rounded-2xl font-black text-xl shadow-xl shadow-emerald-500/20 transition-all"
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
                      {isLoading ? <LoadingSpinner size="sm" /> : 'ابدأ الآن مجاناً'}
                  </Button>
              </div>
          ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="flex items-center gap-3 text-white">
                    <CreditCard className="w-7 h-7 text-amber-500" />
                </div>

                <CustomPaymentForm 
                  amount={finalPrice}
                  description={item.title}
                  metadata={{
                    attemptId: id,
                    itemId: id,
                    testId: type === 'test' ? (item.data?.attempt?.testId || null) : (selectedTestId || null),
                    userId: user?.id,
                    kind: item.kind,
                    discountCodeId: appliedDiscount?.id || null
                  }}
                  onSuccess={(payment) => {
                    toast.success('تمت عملية الدفع بنجاح!')
                    router.push(`/api/payment/verify?id=${payment.id}&status=${payment.status}`)
                  }}
                />
              </div>
          )}

          {/* Review Section */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8 md:p-10 space-y-6 relative group">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[32px] pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex flex-col items-center md:items-start space-y-1">
                    <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className="w-5 h-5 fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-white">4.9/5</span>
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">(+450 مستخدم راضٍ)</span>
                    </div>
                </div>
            </div>
            
            <div className="relative z-10 space-y-4">
                <p className="text-center md:text-right text-base md:text-lg font-bold text-slate-200 italic leading-relaxed">
                    "ما توقعت هذه الدقة في النتائج! التقرير ساعدني جداً في فهم نقاط قوتي وكأنه جلسة استشارية حقيقية."
                </p>
                <div className="flex justify-center md:justify-end items-center gap-3">
                    <div className="text-center md:text-right">
                        <p className="text-sm font-black text-white">إبراهيم م.</p>
                        <p className="text-[11px] font-bold text-slate-500">مدير مشاريع</p>
                    </div>
                </div>
            </div>
          </div>


        </motion.div>
      </div>
    </main>
  )
}
  