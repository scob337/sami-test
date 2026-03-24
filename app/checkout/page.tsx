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
      <div className="min-h-screen flex items-center justify-center bg-[#050B1A]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const benefits = [
    'وصول فوري: كل أدوات الذكاء الاصطناعي في مكان واحد.',
    'بلا مخاطرة: ضمان استرجاع الأموال خلال ٧ أيام.',
    'حرية كاملة: إلغاء الاشتراك في أي وقت بضغطة زر.'
  ]

  return (
    <main className="min-h-screen flex flex-col bg-[#050B1A] font-cairo" dir="rtl">
      <div className="flex-1 py-12 px-4 md:py-20 flex flex-col items-center">
        {/* Progress Bar Component */}
        <div className="w-full max-w-[480px] mb-12 flex items-center justify-between px-2">
            <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-slate-900 font-black text-lg shadow-lg shadow-amber-500/30 transition-transform hover:scale-110">2</div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[10px] text-amber-500 font-black tracking-widest uppercase whitespace-nowrap">الدفاع عن الذات</div>
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
                <div className="absolute top-12 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-black tracking-widest uppercase opacity-50">تمت</div>
            </div>
        </div>

        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">جاهز لبداية التجربة؟</h1>
            <p className="text-slate-400 font-bold text-lg md:text-xl italic max-w-2xl mx-auto">
                مرحباً <span className="text-amber-500">{user?.name?.split(' ')[0] || 'Sam'}</span>! خطوة واحدة وتبدأ فوراً في رحلة تطوير ذاتك.
            </p>
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

          {/* Benefits Section */}
          <div className="space-y-5">
            {benefits.map((benefit, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + 0.1 * i }}
                className="flex items-start gap-4"
              >
                <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-sm md:text-lg font-bold text-slate-200 leading-relaxed">{benefit}</p>
              </motion.div>
            ))}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full" />

          {/* Pricing Summary Box */}
          <div className="w-full bg-slate-900/40 border border-white/5 rounded-3xl p-6 text-center space-y-1 transform hover:scale-[1.02] transition-transform">
            <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">المبلغ الإجمالي</p>
            <div className="flex items-center justify-center gap-2">
                <h2 className="text-4xl md:text-5xl font-black text-amber-500 tracking-tighter">{Math.round(finalPrice)}.00</h2>
                <span className="text-xl font-black text-amber-500/70 pt-2">ر.س</span>
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
                    <span className="text-xl font-black tracking-tight">بيانات البطاقة البنكية</span>
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
                
                <div className="flex flex-col items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 opacity-80">
                    <span>مدفوعات مشفرة وآمنة تماماً عبر</span>
                    <div className="flex items-center gap-1.5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                        <span className="text-slate-200 font-black text-sm tracking-tighter">Stripe</span>
                    </div>
                  </div>
                </div>
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
                <div className="h-10 w-px bg-white/10 hidden md:block" />
                <div className="flex -space-x-3 space-x-reverse">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050B1A] bg-slate-800 overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-full h-full object-cover" />
                        </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-[#050B1A] bg-amber-500 flex items-center justify-center text-[10px] font-black text-slate-900">+4</div>
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
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <Star className="w-5 h-5 text-blue-400 fill-blue-400" />
                    </div>
                </div>
            </div>
          </div>

          {/* Refund policy footer info */}
          <div className="flex items-center justify-center gap-3 text-slate-400 opacity-60">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <p className="text-xs md:text-sm font-black text-center">
                ضمان استرداد الأموال خلال 7 أيام — بدون أسئلة
            </p>
          </div>
        </motion.div>

        {/* Promo Code Section */}
        <div className="mt-12 w-full max-w-[580px] p-2 bg-white/[0.02] border border-white/5 rounded-3xl flex gap-3 items-center">
            <input 
                type="text"
                placeholder="هل لديك كود خصم؟"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className="flex-1 h-14 bg-transparent border-none px-6 text-white font-bold outline-none placeholder:text-slate-600 focus:ring-0 transition-all"
            />
            <Button 
                onClick={handleApplyDiscount}
                disabled={isValidatingDiscount || !discountCode}
                className="h-14 px-10 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black border border-white/10 transition-all hover:border-amber-500/50 active:scale-95"
            >
                {isValidatingDiscount ? <LoadingSpinner size="sm" /> : 'تطبيق الخصم'}
            </Button>
        </div>
      </div>
      <Footer />
    </main>
  )
}