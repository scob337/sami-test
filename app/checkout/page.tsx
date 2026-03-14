'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'

type ItemType = 'book' | 'test'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [item, setItem] = useState<any | null>(null)

  const type = (searchParams?.get('type') || 'book') as ItemType
  const id = searchParams?.get('id') || null

  useEffect(() => {
    // Fetch item info depending on type (book details or test attempt/result)
    const fetchItem = async () => {
      if (!id) return
      try {
        if (type === 'test') {
          const res = await fetch(`/api/test/report?attemptId=${id}`)
          if (!res.ok) throw new Error('فشل جلب بيانات الاختبار')
          const data = await res.json()
          // Expect report to include related result/attempt info; adapt as needed
          setItem({
            kind: 'test',
            title: `تقرير الاختبار #${id}`,
            price: 49.0,
            data,
          })
        } else {
          // For books, call a placeholder API route or static data
          const res = await fetch(`/api/test-library?id=${id}`)
          if (!res.ok) throw new Error('فشل جلب بيانات الكتاب')
          const data = await res.json()
          setItem({
            kind: 'book',
            title: data.title || `كتاب #${id}`,
            price: data.price || 29.0,
            data,
          })
        }
      } catch (error) {
        console.error(error)
        toast.error('حدث خطأ أثناء جلب بيانات العنصر')
      }
    }

    fetchItem()
  }, [type, id])

  const canPurchase = useMemo(() => {
    if (!item) return false
    if (item.kind === 'test') {
      // Front-end guard: only allow purchasing if report/attempt exists and status is COMPLETED
      const attempt = item.data?.result ? item.data.result : item.data
      // attempt may differ shape; check common flags
      return Boolean(attempt) && (attempt.status === 'COMPLETED' || attempt.completedAt)
    }
    return true
  }, [item])

  const handlePayment = async () => {
    if (!item) return
    if (!canPurchase) {
      toast.error('لا يمكنك شراء هذا الاختبار لأنّه لم يكتمل بعد.')
      return
    }

    try {
      setIsLoading(true)
      // Placeholder: here you would call your backend to create a Stripe session
      // const res = await fetch('/api/payments/create-session', { method: 'POST', body: JSON.stringify({ itemId: id, itemType: type }) })
      // then redirect to Stripe Checkout
      await new Promise((r) => setTimeout(r, 900))
      toast.success('سيتم توجيهك إلى بوابة الدفع (تجريبي)')
      // router.push('/payments/success') // on real flow redirect after payment
    } catch (error) {
      console.error(error)
      toast.error('حدث خطأ أثناء معالجة الدفع')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <Section size="lg" className="flex-1">
        <Container size="md">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
              <h1 className="text-3xl font-bold">بوابة الدفع</h1>
              <p className="text-muted-foreground">راجع بيانات الشراء ثم تابع إلى الدفع الآمن</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-2">معلومات الطلب</h2>
                  {!item ? (
                    <div className="py-8 flex items-center justify-center">
                      <LoadingSpinner size="lg" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-lg">{item.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">{item.kind === 'test' ? 'تقرير اختبار' : 'كتاب رقمي'}</div>
                        </div>
                        <div className="text-lg font-bold">{item.price} ر.س</div>
                      </div>

                      {item.kind === 'test' && (
                        <div className="text-sm text-muted-foreground">
                          {item.data?.reportText ? (
                            <div className="whitespace-pre-wrap">{item.data.reportText.substring(0, 300)}...</div>
                          ) : (
                            <div>لا يتوفر نص التقرير الآن.</div>
                          )}
                        </div>
                      )}

                      {item.kind === 'book' && (
                        <div className="text-sm text-muted-foreground">وصف الكتاب: {item.data?.description || '—'}</div>
                      )}
                    </div>
                  )}
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-2">تفاصيل الشحن/الفاتورة</h3>
                  <p className="text-sm text-muted-foreground">سيُرسل المحتوى الرقمي إلى حسابك بعد اكتمال الدفع.</p>
                </Card>
              </div>

              <div>
                <Card className="p-6 sticky top-24">
                  <h3 className="font-semibold mb-4">ملخص الدفع</h3>
                  <div className="flex justify-between mb-2">
                    <span>سعر العنصر</span>
                    <span className="font-semibold">{item ? `${item.price} ر.س` : '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>الخصم</span>
                    <span>0 ر.س</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-t border-border">
                    <span className="font-semibold">المبلغ الإجمالي</span>
                    <span className="text-2xl font-bold">{item ? `${item.price} ر.س` : '—'}</span>
                  </div>

                  <div className="mt-6">
                    <Button onClick={handlePayment} disabled={isLoading || !canPurchase} className="w-full h-12 bg-primary text-white font-semibold">
                      {isLoading ? (
                        <div className="flex items-center gap-2 justify-center">
                          <LoadingSpinner size="sm" />
                          جاري التوجيه
                        </div>
                      ) : (
                        canPurchase ? 'الدفع الآن' : 'غير متاح للشراء'
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center mt-4">🔒 الدفع آمن ومشفر — ربط Stripe لاحقاً</p>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <Footer />
    </main>
  )
}
