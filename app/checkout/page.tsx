'use client'

import { useEffect, useState, Suspense, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  CreditCard,
  Zap,
  BookOpen,
  Lock,
  CheckCircle2,
  Star,
  Package,
  Check,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { CustomPaymentForm } from '@/components/checkout/custom-payment-form'
import { getPackageById, type BookPackage } from '@/lib/book-packages'

type ItemType = 'book' | 'test' | 'course' | 'package'

interface CheckoutItem {
  kind: ItemType
  title: string
  price: number
  description: string
  features: string[]
  packageId?: string
  data?: any
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
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
  const [appliedDiscount, setAppliedDiscount] = useState<{
    id: string
    amount: number
    type: string
  } | null>(null)
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false)
  const { user } = useAuthStore()

  const type = (searchParams?.get('type') || 'book') as ItemType
  const id = searchParams?.get('id')
  const bookId = searchParams?.get('bookId')
  const packageId = searchParams?.get('package')

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
        if (type === 'package' && bookId && packageId) {
          const res = await fetch(`/api/test-library?id=${bookId}`)
          if (!res.ok) throw new Error()
          const data = await res.json()
          const pkg = getPackageById(packageId, {
            id: data.id,
            title: data.title,
            price: data.price ?? 0,
            reportPrice: data.reportPrice ?? 0,
            bookOnlyPrice: data.bookOnlyPrice ?? 0,
            pricingPlans: data.pricingPlans,
            hasActiveTest: (data.tests?.length ?? 0) > 0,
          })
          if (!pkg || pkg.price <= 0) {
            toast.error('باقة غير صالحة')
            router.push('/#plans')
            return
          }
          setItem({
            kind: 'package',
            title: pkg.name,
            price: pkg.price,
            description: buildPackageDescription(pkg),
            features: pkg.features,
            packageId: pkg.id,
            data: { book: data, package: pkg },
          })
          if (data.tests?.length > 0) {
            setSelectedTestId(data.tests[0].id)
          }
          return
        }

        if (!id) {
          setItem({
            kind: 'test',
            title: 'تقرير تحليل الشخصية المتقدم',
            price: 199,
            description: 'تقرير شامل يتضمن تحليل لنقاط القوة والضعف وتوصيات مهنية وشخصية.',
            features: [
              'تحليل الشخصية الأساسية والثانوية',
              'نقاط القوة والتحديات',
              'توصيات عملية',
            ],
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
            features: ['تقرير مفصل بعد الاختبار', 'توصيات مخصصة'],
            data,
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
            features: ['وصول كامل للدورة', 'محتوى تفاعلي'],
            data,
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
            features: ['نسخة رقمية PDF', 'شرح الشخصيات السبعة'],
            data,
          })
          if (data.tests?.length > 0) {
            setSelectedTestId(data.tests[0].id)
          }
        }
      } catch (error) {
        console.error(error)
        toast.error('فشل تحميل بيانات العنصر')
      }
    }

    fetchItem()
  }, [type, id, bookId, packageId, router])

  const handleApplyDiscount = async (codeOverride?: string) => {
    const codeToUse = codeOverride !== undefined ? codeOverride : discountCode
    if (!codeToUse.trim()) return
    try {
      setIsValidatingDiscount(true)
      const res = await fetch('/api/user/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeToUse,
          userId: user?.id,
          courseId: type === 'course' ? id : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'كود غير صالح')
      setAppliedDiscount(data)
      toast.success('تم تطبيق الخصم بنجاح')
    } catch (error: unknown) {
      if (codeOverride === undefined) {
        toast.error(error instanceof Error ? error.message : 'كود غير صالح')
      }
      setAppliedDiscount(null)
    } finally {
      setIsValidatingDiscount(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (discountCode.length >= 3 && !appliedDiscount) {
        handleApplyDiscount(discountCode)
      }
    }, 800)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountCode])

  const paymentMetadata = useMemo(() => {
    const bookData = item?.data?.book
    const pkg = item?.data?.package as BookPackage | undefined
  const resolvedBookId = bookId || id || bookData?.id

    return {
      attemptId: id,
      itemId: resolvedBookId,
      testId:
        type === 'test'
          ? item?.data?.attempt?.testId || null
          : selectedTestId || null,
      userId: user?.id,
      kind: item?.kind === 'package' ? (pkg?.includesReport ? 'test' : 'book') : item?.kind,
      packageId: item?.packageId || null,
      discountCodeId: appliedDiscount?.id || null,
    }
  }, [item, type, id, bookId, selectedTestId, user?.id, appliedDiscount?.id])

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <main className="min-h-screen flex flex-col bg-background font-cairo py-12 px-4 md:py-20" dir="rtl">
      <div className="flex-1 flex flex-col items-center max-w-xl mx-auto w-full">
        <div className="text-center space-y-3 mb-10">
          <span className="landing-eyebrow">الخطوة الأخيرة</span>
          <h1 className="text-3xl md:text-4xl font-black text-foreground">إتمام الطلب</h1>
          <p className="text-muted-foreground font-bold">
            مرحباً{' '}
            <span className="text-primary">{user?.name?.split(' ')[0] || 'بك'}</span> — راجع
            تفاصيل باقتك قبل الدفع
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-card border border-border rounded-[32px] p-8 md:p-10 shadow-[var(--brand-shadow)] space-y-8"
        >
          {/* Package summary */}
          <div className="rounded-3xl border border-border bg-[#fff8ea] p-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0 border border-primary/20">
                {item.kind === 'package' ? (
                  <Package className="w-7 h-7 text-primary" />
                ) : item.kind === 'test' ? (
                  <Zap className="w-7 h-7 text-primary" />
                ) : (
                  <BookOpen className="w-7 h-7 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-wider mb-1">
                  {item.kind === 'package' ? 'الباقة المختارة' : 'المنتج'}
                </p>
                <h2 className="text-xl font-black text-foreground">{item.title}</h2>
                <p className="text-sm font-bold text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>

            {item.features.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-border">
                <p className="text-sm font-black text-foreground">يشمل هذا الطلب:</p>
                <ul className="space-y-2">
                  {item.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2.5 text-sm font-bold text-[#4c3920]"
                    >
                      <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-primary" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="font-black text-muted-foreground">سعر الباقة</span>
              <span className="text-2xl font-black text-foreground">{item.price} ر.س</span>
            </div>
            {appliedDiscount && (
              <div className="flex justify-between items-center text-sm font-bold text-[var(--brand-green)]">
                <span>خصم ({appliedDiscount.id})</span>
                <span>-{Math.round(item.price - finalPrice)} ر.س</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xl font-black text-primary pt-2">
              <span>المجموع النهائي</span>
              <span>{Math.round(finalPrice)} ر.س</span>
            </div>
          </div>

          {/* Discount */}
          <div className="flex gap-2 p-2 bg-muted/50 border border-border rounded-2xl">
            <input
              type="text"
              placeholder="كود الخصم (اختياري)"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="flex-1 h-12 bg-transparent border-none px-4 text-foreground font-bold outline-none placeholder:text-muted-foreground"
            />
            <Button
              onClick={() => handleApplyDiscount()}
              disabled={isValidatingDiscount || !discountCode}
              variant="outline"
              className="h-12 px-6 rounded-xl font-black border-border"
            >
              {isValidatingDiscount ? <LoadingSpinner size="sm" /> : 'تطبيق'}
            </Button>
          </div>

          {!user ? (
            <div className="flex flex-col items-center p-8 space-y-4 bg-muted/30 rounded-3xl border border-dashed border-border text-center">
              <Lock className="w-10 h-10 text-muted-foreground" />
              <h3 className="text-xl font-black">تسجيل الدخول مطلوب</h3>
              <p className="text-muted-foreground font-bold text-sm">
                سجّل دخولك لإتمام الدفع والوصول لمحتواك
              </p>
              <Button
                className="btn-gold h-12 px-8 border-none"
                onClick={() => {
                  const currentUrl = encodeURIComponent(
                    window.location.pathname + window.location.search
                  )
                  router.push(`/auth/login?redirect=${currentUrl}`)
                }}
              >
                تسجيل الدخول
              </Button>
            </div>
          ) : finalPrice === 0 ? (
            <div className="flex flex-col items-center p-8 space-y-4 bg-[var(--brand-green)]/10 rounded-3xl border border-[var(--brand-green)]/20 text-center">
              <CheckCircle2 className="w-12 h-12 text-[var(--brand-green)]" />
              <h3 className="text-xl font-black">طلب مجاني</h3>
              <Button
                className="btn-gold w-full h-14 border-none"
                disabled={isLoading}
                onClick={async () => {
                  try {
                    setIsLoading(true)
                    const res = await fetch('/api/payment/free', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(paymentMetadata),
                    })
                    if (!res.ok) throw new Error()
                    const { redirectUrl } = await res.json()
                    if (redirectUrl) router.push(redirectUrl)
                  } catch {
                    toast.error('حدث خطأ أثناء إتمام الطلب')
                    setIsLoading(false)
                  }
                }}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : 'إتمام الطلب مجاناً'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-foreground font-black">
                <CreditCard className="w-5 h-5 text-primary" />
                الدفع الآمن
              </div>
              <CustomPaymentForm
                amount={finalPrice}
                description={item.title}
                metadata={paymentMetadata}
                onSuccess={(payment) => {
                  toast.success('تمت عملية الدفع بنجاح!')
                  router.push(`/api/payment/verify?id=${payment.id}&status=${payment.status}`)
                }}
              />
            </div>
          )}

          <div className="rounded-2xl border border-border p-5 bg-muted/20">
            <div className="flex gap-1 mb-2 justify-center">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm font-bold text-muted-foreground text-center italic leading-relaxed">
              &quot;ما توقعت هذه الدقة في النتائج! التقرير ساعدني جداً في فهم نقاط قوتي.&quot;
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

function buildPackageDescription(pkg: BookPackage): string {
  const parts: string[] = []
  if (pkg.includesBook) parts.push('الكتاب')
  if (pkg.includesTest) parts.push('الاختبار')
  if (pkg.includesReport) parts.push('التقرير المفصل')
  return parts.length > 0 ? `تشمل: ${parts.join(' + ')}` : pkg.name
}
