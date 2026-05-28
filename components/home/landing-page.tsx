'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  buildBookPackages,
  getPackageActionUrl,
  getTestUrl,
  type BookPackage,
} from '@/lib/book-packages'
import { LandingSectionNav } from '@/components/home/landing-section-nav'
import { cn } from '@/lib/utils'

type LandingBook = {
  id: number
  slug: string
  title: string
  price: number
  reportPrice?: number
  bookOnlyPrice?: number
  hasActiveTest?: boolean
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroDescription?: string | null
  heroImage?: string | null
  expertName?: string | null
  bookDetails?: { image?: string; points?: string[] } | null
  pricingPlans?: unknown
  tests?: { id: number; slug: string; name: string }[]
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5 },
}

export function LandingPage({ book }: { book: LandingBook | null }) {
  const packages = book
    ? buildBookPackages({
        id: book.id,
        title: book.title,
        price: book.price,
        reportPrice: book.reportPrice,
        bookOnlyPrice: book.bookOnlyPrice,
        pricingPlans: Array.isArray(book.pricingPlans)
          ? (book.pricingPlans as never[])
          : null,
        hasActiveTest: book.hasActiveTest ?? (book.tests?.length ?? 0) > 0,
      })
    : []
  const testSlug = book?.tests?.[0]?.slug
  const testId = book?.tests?.[0]?.id
  const bookImage =
    (book?.bookDetails as { image?: string } | null)?.image ||
    book?.heroImage ||
    '/book-cover.jpeg'

  return (
    <div className="flex flex-col" dir="rtl">
      {/* Hero */}
      <section className="relative pt-8 pb-16 md:pt-12 md:pb-24" id="start">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-10 lg:gap-14 items-center">
            <motion.div {...fadeUp} className="space-y-6 text-center lg:text-right">
              <span className="landing-eyebrow">
                اختبار مجاني، نتيجة فورية، ثم كتاب وتقرير لمن يريد الفهم الأعمق
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.2] text-foreground tracking-tight">
                {book?.heroTitle ||
                  'أكثر خلافاتك لا تبدأ من الكلام، بل من تفسيرك لشخصية من أمامك.'}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-bold leading-relaxed max-w-xl mx-auto lg:mx-0 lg:mr-0">
                {book?.heroDescription ||
                  book?.heroSubtitle ||
                  'اكتشف نمط شخصيتك من بين الشخصيات السبعة، وافهم لماذا تختلف مع الناس رغم أن النية طيبة.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start hero-actions">
                <Link href="#quiz" className="btn-gold text-center">
                  ابدأ الاختبار المجاني الآن
                </Link>
                <Link href="#plans" className="btn-ghost-warm text-center">
                  اختر باقتك
                </Link>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 pt-4 text-right">
                {[
                  ['✓', 'نتيجة فورية', 'تعرف شخصيتك الأساسية خلال دقائق'],
                  ['✓', 'يربط النتيجة بالتطبيق', 'الكتاب والتقرير يشرحان ماذا تفعل بعد معرفة النتيجة'],
                  ['✓', 'خصوصية تامة', 'إجاباتك لا تُشارك مع أحد'],
                ].map(([dot, title, sub]) => (
                  <div
                    key={title}
                    className="flex gap-2.5 items-start text-sm font-bold text-[#4c3920] bg-[#fff8ea] border border-border rounded-2xl p-4"
                  >
                    <span className="w-7 h-7 rounded-full bg-[#f1dfbd] text-[#543704] flex items-center justify-center shrink-0 font-black text-xs">
                      {dot}
                    </span>
                    <span>
                      {title}
                      <small className="block text-muted-foreground font-medium mt-0.5">{sub}</small>
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-[#5a4325] bg-[#fff8ea] border border-border rounded-2xl p-4">
                أكثر من 450 شخصًا بدأوا الاختبار واختاروا الكتاب لفهم أنفسهم والآخرين بوضوح أكبر.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ delay: 0.1 }}
              id="quiz"
              className="rounded-[42px] border border-border bg-gradient-to-b from-[#fffdf8] to-[#f1e3cf] p-4 shadow-[var(--brand-shadow)]"
            >
              <div className="rounded-[28px] overflow-hidden border border-border">
                <div className="p-6 text-white bg-gradient-to-br from-[var(--brand-dark)] to-[#5c3f18]">
                  <small className="text-[#e8c779] font-black text-sm">معاينة الاختبار</small>
                  <h2 className="text-xl font-black mt-2 leading-snug">
                    عندما ينتقدك شخص أمام الآخرين، ما ردك الطبيعي غالبًا؟
                  </h2>
                </div>
                <div className="p-5 bg-card space-y-3">
                  {[
                    'أرد بقوة وأوضح موقفي',
                    'أصمت وأفكر قبل أن أتكلم',
                    'أحاول تهدئة الجو',
                    'أبتسم وأغير الموضوع',
                  ].map((label) => (
                    <label
                      key={label}
                      className="flex items-center gap-3 border border-border bg-white rounded-2xl px-4 py-3 text-[#473520] font-bold text-sm cursor-default"
                    >
                      <span className="w-4 h-4 rounded-full border-2 border-primary/40" />
                      {label}
                    </label>
                  ))}
                  <Link
                    href={getTestUrl(testSlug, testId)}
                    className="btn-gold w-full text-center mt-2"
                  >
                    ابدأ الاختبار
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section id="why" className="py-16 md:py-20 bg-[rgba(255,250,243,0.5)]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl md:text-4xl font-black mb-4">
              لماذا تحتاج الاختبار قبل أن تحكم على نفسك أو على غيرك؟
            </h2>
            <p className="text-muted-foreground font-bold text-lg">
              لأن فهم النمط يساعدك تقلل سوء الظن وتتعامل بوعي أكبر
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              ['١', 'تفهم رد فعلك الأول', 'لماذا تندفع، تسكت، تدقق، أو تحاول تهدئة الجو عندما يضغطك الموقف.'],
              ['٢', 'تقلل سوء الظن', 'تبدأ تفرق بين الشخص الذي يقصد الأذى، والشخص الذي يعبر بطريقته فقط.'],
              ['٣', 'تتعامل بوعي أكبر', 'بدل تكرار الخلاف نفسه، تعرف الباب المناسب للكلام مع كل شخصية.'],
            ].map(([num, title, desc]) => (
              <motion.div key={title} {...fadeUp} className="landing-card">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary font-black flex items-center justify-center mb-4">
                  {num}
                </div>
                <h3 className="text-lg font-black mb-2">{title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="py-16 md:py-20">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl md:text-4xl font-black mb-4">كيف تبدأ رحلتك؟</h2>
            <p className="text-muted-foreground font-bold text-lg">
              الرحلة مختصرة: ابدأ مجانًا، خذ النتيجة، ثم قرر هل تحتاج الفهم المختصر أو القراءة العميقة.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              ['١', 'ابدأ الاختبار المجاني', 'أسئلة قصيرة مبنية على مواقف من البيت، العمل، الأصدقاء، والنقاش.'],
              ['٢', 'اعرف شخصيتك', 'تظهر لك شخصيتك الأساسية والثانوية، مع وصف مختصر وسهل.'],
              ['٣', 'حوّل النتيجة إلى تصرف', 'الكتاب والتقرير يعطيانك أمثلة وجملًا عملية للتعامل مع نفسك والآخرين.'],
            ].map(([num, title, desc]) => (
              <motion.div key={title} {...fadeUp} className="landing-card">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary font-black flex items-center justify-center mb-4">
                  {num}
                </div>
                <h3 className="text-lg font-black mb-2">{title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Offer / Book */}
      <section id="offer" className="py-16 md:py-20">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[0.88fr_1.12fr] gap-8 items-center rounded-[40px] border border-border bg-gradient-to-br from-[#fffaf3] to-[#f2e4cf] p-8 md:p-10 shadow-[var(--brand-shadow)] overflow-hidden">
            <div className="relative max-w-[370px] mx-auto w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bookImage}
                alt={book?.title || 'غلاف الكتاب'}
                className="w-full h-auto rounded-3xl border border-[#e8e1d6] shadow-[0_30px_70px_rgba(20,17,12,0.18)] bg-white object-cover"
              />
            </div>
            <div className="space-y-5 text-center lg:text-right">
              <span className="landing-eyebrow">الكتاب هو المرحلة الثانية بعد الاختبار</span>
              <h2 className="text-2xl md:text-4xl font-black leading-tight">
                لا تكتفِ باسم شخصيتك، افهم كيف تظهر في حياتك.
              </h2>
              <p className="text-lg font-bold text-muted-foreground leading-relaxed">
                الاختبار يعطيك البداية، والكتاب يشرح لك الشخصيات السبعة بمواقف واقعية من الزواج،
                العمل، الأبناء، الأصدقاء، والنقاش.
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 text-right">
                {(
                  (book?.bookDetails as { points?: string[] } | null)?.points || [
                    'فهم نقاط القوة والضعف',
                    'أمثلة من الحياة اليومية',
                    'لغة بسيطة بعيدًا عن المصطلحات المعقدة',
                    'يربط الاختبار بالتطبيق العملي',
                  ]
                ).map((point) => (
                  <li
                    key={point}
                    className="bg-[#fff4df] border border-border rounded-2xl px-4 py-3 text-[#4c3920] font-bold text-sm"
                  >
                    {point}
                  </li>
                ))}
              </ul>
              <Link href="#plans" className="btn-gold inline-flex">
                احصل على الكتاب مع التقرير
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy strip */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-[38px] border border-border bg-card p-8 md:p-10 text-center shadow-[var(--brand-shadow)]">
            <h2 className="text-xl md:text-3xl font-black leading-snug mb-4">
              هذه ليست صفحة تبيع كتابًا فقط، هذه صفحة تبدأ بسؤال داخل الزائر.
            </h2>
            <p className="text-muted-foreground font-bold text-lg max-w-3xl mx-auto leading-relaxed">
              لماذا أفهم بعض الناس بسرعة، وأتعب مع آخرين؟ عندما يشعر الزائر أن السؤال يخصه، يصبح
              الاختبار خطوة طبيعية، ويصبح الكتاب امتدادًا للفهم، لا إعلانًا مباشرًا.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing — من بيانات الكتاب الفعلية */}
      {book && packages.length > 0 && (
        <section id="plans" className="py-16 md:py-24">
          <div className="container max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl md:text-4xl font-black mb-3">ابدأ مجانًا، ثم اختر ما يناسبك</h2>
              <p className="text-muted-foreground font-bold">
                باقات مرتبطة بكتاب: <span className="text-foreground">{book.title}</span>
              </p>
            </div>
            <div
              className={cn(
                'grid gap-6 items-stretch',
                packages.length === 1
                  ? 'max-w-md mx-auto'
                  : packages.length === 2
                    ? 'md:grid-cols-2 max-w-3xl mx-auto'
                    : 'md:grid-cols-3'
              )}
            >
              {packages.map((pkg) => (
                <PricingPlanCard
                  key={pkg.id}
                  pkg={pkg}
                  bookId={book.id}
                  testSlug={testSlug}
                  testId={testId}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="py-16 bg-[rgba(255,250,243,0.5)]">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10">أسئلة سريعة</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              [
                'هل الاختبار مجاني؟',
                'نعم، البداية مجانية وتظهر نتيجة مختصرة، ثم يمكن شراء التقرير أو الكتاب لمن يريد فهمًا أعمق.',
              ],
              [
                'هل النتيجة تحكم على الشخص؟',
                'لا، النتيجة تساعدك تفهم طريقتك الغالبة، وليست حكمًا نهائيًا عليك.',
              ],
              [
                'هل يناسب الزواج والعمل؟',
                'نعم، لأن الأمثلة مبنية على مواقف يومية في العلاقات، العمل، النقاش، الأبناء، والأصدقاء.',
              ],
            ].map(([q, a]) => (
              <div key={q} className="landing-card">
                <h3 className="font-black text-lg mb-2">{q}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 pb-24">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <div className="rounded-[38px] bg-gradient-to-br from-[var(--brand-dark)] to-[#5a3d15] text-white p-10 md:p-14 text-center shadow-[var(--brand-shadow)]">
            <h2 className="text-2xl md:text-3xl font-black mb-4">
              ابدأ بالاختبار، ثم اقرأ نفسك بطريقة أوضح.
            </h2>
            <p className="text-[#eadbc5] font-bold text-lg mb-8 max-w-xl mx-auto">
              {book?.expertName
                ? `من إعداد ${book.expertName} — بوصلة الشخصيات السبعة`
                : 'بوصلة الشخصيات السبعة — من الخبير سامي'}
            </p>
            <Link
              href={getTestUrl(testSlug, testId)}
              className="btn-gold inline-flex"
            >
              ابدأ الاختبار المجاني الآن
            </Link>
          </div>
        </div>
      </section>

      <LandingSectionNav />
    </div>
  )
}

function PricingPlanCard({
  pkg,
  bookId,
  testSlug,
  testId,
}: {
  pkg: BookPackage
  bookId: number
  testSlug?: string | null
  testId?: number | null
}) {
  const href = getPackageActionUrl(bookId, pkg, testSlug, testId)
  const isFree = pkg.id === 'free'

  return (
    <motion.div
      {...fadeUp}
      className={cn('plan-card flex flex-col h-full', pkg.isFeatured && 'plan-card-featured')}
    >
      {pkg.badge && (
        <span className="absolute top-4 left-4 rounded-full bg-gradient-to-br from-primary to-accent text-[#1c1308] text-xs font-black px-3 py-1.5">
          {pkg.badge}
        </span>
      )}
      <h3 className="text-xl font-black mb-2 mt-2">{pkg.name}</h3>
      <div className="mb-6">
        <span className="text-4xl font-black text-foreground">
          {pkg.price === 0 ? '0' : pkg.price}
        </span>
        <span className="text-muted-foreground font-bold mr-1">
          {pkg.price === 0 ? ' ريال' : ' ر.س'}
        </span>
        {pkg.oldPrice != null && pkg.oldPrice > 0 && (
          <span className="block text-muted-foreground line-through text-sm mt-1 font-bold">
            {pkg.oldPrice} ر.س
          </span>
        )}
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {pkg.features.map((f) => (
          <li key={f} className="flex gap-2 text-sm font-bold text-[#4c3920]">
            <span className="text-primary">✓</span>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={cn(
          'w-full text-center',
          isFree || !pkg.isFeatured ? 'btn-ghost-warm' : 'btn-gold'
        )}
      >
        {pkg.ctaLabel}
      </Link>
    </motion.div>
  )
}
