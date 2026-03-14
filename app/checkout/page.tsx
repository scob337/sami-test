'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Check } from 'lucide-react'
import { toast } from 'sonner'

const PREMIUM_FEATURES = [
  'تقرير شامل مفصل عن شخصيتك',
  'وصول غير محدود إلى مكتبة الكتب',
  'توصيات تطوير شخصي مخصصة',
  'إعادة الاختبار بدون حد',
  'تقارير حول التوافقية مع الآخرين',
  'دعم فني أولوية',
]

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handlePayment = async () => {
    try {
      setIsLoading(true)

      // TODO: Integrate Stripe checkout
      console.log('Processing payment...')

      toast.success('تم توجيهك إلى بوابة الدفع')
      // In real implementation, this would redirect to Stripe
    } catch (error) {
      toast.error('حدث خطأ أثناء معالجة الدفع')
      console.error(error)
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
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ترقية للعضوية المميزة
              </h1>
              <p className="text-xl text-muted-foreground">
                احصل على وصول كامل لجميع المميزات والتقارير الشاملة
              </p>
            </motion.div>

            {/* Grid */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Features */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                {PREMIUM_FEATURES.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Payment Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-8 border-primary/20 sticky top-20">
                  {/* Price */}
                  <div className="mb-8">
                    <div className="text-4xl font-bold mb-2">
                      99<span className="text-xl font-semibold"> ر.س</span>
                    </div>
                    <p className="text-muted-foreground">
                      دفعة واحدة مدى الحياة
                    </p>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-3 pb-8 border-b border-border/40">
                    <div className="flex justify-between text-sm">
                      <span>التقرير الشامل</span>
                      <span>99 ر.س</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>ضريبة (15%)</span>
                      <span>14.85 ر.س</span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-8">
                    <span className="font-semibold">المجموع</span>
                    <span className="text-2xl font-bold">113.85 ر.س</span>
                  </div>

                  {/* Payment Button */}
                  <Button
                    onClick={handlePayment}
                    disabled={isLoading}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        جاري المعالجة...
                      </div>
                    ) : (
                      'الدفع الآن'
                    )}
                  </Button>

                  {/* Security */}
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    🔒 الدفع آمن ومشفر
                  </p>
                </Card>
              </motion.div>
            </div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-16 space-y-6"
            >
              <h2 className="text-2xl font-bold">أسئلة شائعة</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">هل هناك نسخة تجريبية؟</h3>
                  <p className="text-sm text-muted-foreground">
                    يمكنك الحصول على النتائج الأساسية مجاناً. العضوية المميزة تشمل التقارير الشاملة والموارد الإضافية.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">هل يوجد ضمان استرجاع؟</h3>
                  <p className="text-sm text-muted-foreground">
                    نعم، لديك 30 يوم كامل لاسترجاع أموالك بدون أي أسئلة إذا لم تكن راضياً.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">كيف يتم الدفع؟</h3>
                  <p className="text-sm text-muted-foreground">
                    نحن نقبل بطاقات الائتمان والخصم من خلال Stripe آمن وموثوق.
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="font-semibold mb-2">هل لديكم دعم عملاء؟</h3>
                  <p className="text-sm text-muted-foreground">
                    بالتأكيد! فريقنا متاح 24/7 للإجابة على أي استفسارات لديك.
                  </p>
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
