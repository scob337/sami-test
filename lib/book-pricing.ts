import type { DbPricingPlan } from '@/lib/book-packages'

/** يولّد باقات JSON من أسعار الكتاب المخزّنة */
export function buildPricingPlansFromBookPrices(input: {
  title: string
  price: number
  reportPrice: number
  bookOnlyPrice: number
  hasActiveTest?: boolean
}): DbPricingPlan[] {
  const bundlePrice = input.price > 0 ? input.price : 49
  const reportOnly =
    input.reportPrice > 0 ? input.reportPrice : Math.max(1, Math.round(bundlePrice * 0.55))
  const bookOnly =
    input.bookOnlyPrice > 0
      ? input.bookOnlyPrice
      : Math.max(1, Math.round(bundlePrice * 0.92))
  const shortTitle =
    input.title.length > 28 ? `${input.title.slice(0, 28)}…` : input.title

  const plans: DbPricingPlan[] = []

  if (input.hasActiveTest !== false) {
    plans.push({
      packageId: 'free',
      name: 'الاختبار المجاني',
      price: 0,
      features: ['نتيجة مختصرة', 'الشخصية الأساسية', 'الشخصية الثانوية'],
      ctaLabel: 'ابدأ مجانًا',
      includesTest: true,
      includesBook: false,
      includesReport: false,
    })
  }

  plans.push(
    {
      packageId: 'book-report',
      name: 'الكتاب مع التقرير',
      price: bundlePrice,
      oldPrice: Math.round(bundlePrice * 1.75),
      features: [
        'اختبار الشخصيات السبعة',
        'تقرير شخصي أوضح',
        `كتاب: ${shortTitle}`,
        'أمثلة عملية للحياة اليومية',
      ],
      isFeatured: true,
      badge: 'الأكثر طلبًا',
      includesTest: true,
      includesBook: true,
      includesReport: true,
      ctaLabel: 'احصل على الباقة',
    },
    {
      packageId: 'book-only',
      name: 'الكتاب فقط',
      price: bookOnly,
      oldPrice: Math.round(bookOnly * 1.35),
      features: [
        `كتاب: ${shortTitle}`,
        'شرح الشخصيات السبعة',
        'أمثلة واقعية',
      ],
      includesTest: false,
      includesBook: true,
      includesReport: false,
      ctaLabel: 'شراء الكتاب',
    }
  )

  // باقة التقرير/الاختبار المدفوع منفصلة إن وُجد سعر مستقل
  if (reportOnly > 0 && input.hasActiveTest !== false) {
    plans.splice(1, 0, {
      packageId: 'report-only',
      name: 'التقرير المفصل',
      price: reportOnly,
      oldPrice: Math.round(reportOnly * 1.4),
      features: [
        'تقرير شخصي كامل بعد الاختبار',
        'تحليل النمط الأساسي والثانوي',
        'توصيات عملية',
      ],
      includesTest: true,
      includesBook: false,
      includesReport: true,
      ctaLabel: 'احصل على التقرير',
    })
  }

  return plans
}
