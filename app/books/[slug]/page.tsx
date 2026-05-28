import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'
import { BookOpen, CheckCircle, Check, Star, Download, ChevronRight, PlayCircle, BarChart, Settings, Users } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { buildBookPackages, getPackageActionUrl } from '@/lib/book-packages'
import { BookTestModal } from '@/components/ui/book-test-modal'

interface BookPageProps {
  params: Promise<{ slug: string }>
}

export default async function BookLandingPage({ params }: BookPageProps) {
  const { slug } = await params
  
  const book = await prisma.book.findUnique({
    where: { slug, isActive: true },
    include: { tests: true }
  })

  if (!book) {
    notFound()
  }

  // Parse JSON fields safely
  const features = Array.isArray(book.features) ? book.features : []
  const audience = Array.isArray(book.audience) ? book.audience : []
  const steps = Array.isArray(book.steps) ? book.steps : []
  const assistant = typeof book.assistant === 'object' && book.assistant !== null ? book.assistant as any : null
  const pricingPlans = buildBookPackages({
    id: book.id,
    title: book.title,
    price: book.price,
    reportPrice: book.reportPrice,
    bookOnlyPrice: book.bookOnlyPrice,
    pricingPlans: Array.isArray(book.pricingPlans) ? (book.pricingPlans as never[]) : null,
    hasActiveTest: book.tests.length > 0,
  })
  const testSlug = book.tests[0]?.slug
  const testId = book.tests[0]?.id
  
  return (
    <main className="min-h-screen bg-background text-foreground" dir="rtl">
      
      {/* 1. Hero Section */}
      <Section className="relative overflow-hidden pt-32 pb-20 mt-[-64px] bg-gradient-to-b from-primary/5 via-background to-background">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {book.heroSubtitle && (
                 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background border border-border text-primary font-black text-sm shadow-sm">
                   <BookOpen className="w-4 h-4" />
                   {book.heroSubtitle}
                 </div>
              )}
              
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                {book.heroTitle || book.title}
              </h1>
              
              {book.expertName && (
                <div className="flex items-center gap-3 text-muted-foreground font-bold text-lg">
                   <span className="w-12 h-[1px] bg-border block"></span>
                   من إعداد: {book.expertName}
                   <span className="w-12 h-[1px] bg-border block"></span>
                </div>
              )}
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                {book.heroDescription || book.description}
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                {book.tests.length > 0 ? (
                  <BookTestModal 
                    testId={book.tests[0].slug} 
                    triggerButtonText="ابدأ الاختبار الآن"
                    className="bg-gradient-to-l from-primary to-blue-600 hover:opacity-90 text-white rounded-full font-bold px-8 h-14 shadow-lg shadow-primary/30 group"
                  />
                ) : (
                  <Button size="lg" disabled className="bg-gradient-to-l from-primary to-blue-600 opacity-50 text-white rounded-full font-bold px-8 h-14 cursor-not-allowed group">
                    لا يوجد اختبار
                  </Button>
                )}
                {book.filePdf && (
                   <Link href={book.filePdf} target="_blank">
                     <Button variant="outline" size="lg" className="rounded-full font-bold px-8 h-14 border-2">
                       تصفح الفهرس
                     </Button>
                   </Link>
                )}
              </div>
            </div>
            
            {/* Hero Image/Card */}
            <div className="lg:mr-auto">
              <div className="bg-gradient-to-b from-primary/5 to-background border border-border rounded-[40px] p-6 shadow-2xl relative">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background/0 to-transparent rounded-[40px] pointer-events-none" />
                 <img 
                   src={book.heroImage || '/placeholder-book.png'} 
                   alt={book.title}
                   className="w-full max-w-[380px] mx-auto rounded-3xl shadow-lg border border-border bg-card relative z-10"
                 />
                 
                 <div className="grid grid-cols-2 gap-4 mt-6 relative z-10">
                   <div className="bg-card p-4 rounded-2xl border border-border text-center shadow-sm">
                      <span className="block text-2xl font-black text-primary mb-1">+{book.tests.length}</span>
                      <span className="text-xs font-bold text-muted-foreground">اختبارات مساعدة</span>
                   </div>
                   <div className="bg-card p-4 rounded-2xl border border-border text-center shadow-sm">
                      <span className="block text-2xl font-black text-emerald-500 mb-1">دقيق</span>
                      <span className="text-xs font-bold text-muted-foreground">مبني على أسس</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 2. Steps Section */}
      {steps.length > 0 && (
        <Section className="bg-muted/30">
          <Container>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4">كيف يعمل هذا الدليل؟</h2>
              <p className="text-muted-foreground text-lg">خطوات بسيطة نحو فهم أعمق لنفسك ولمن حولك</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
               <div className="hidden md:block absolute top-[28px] left-[15%] right-[15%] h-[2px] bg-border border-dashed border-2 z-0"></div>
               {steps.map((step: any, idx: number) => (
                 <div key={idx} className="bg-card border border-border rounded-3xl p-8 relative z-10 shadow-sm text-center group hover:-translate-y-2 transition-transform">
                   <div className="w-14 h-14 bg-primary text-primary-foreground font-black text-xl rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
                     {idx + 1}
                   </div>
                   <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                   <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                 </div>
               ))}
            </div>
          </Container>
        </Section>
      )}

      {/* 3. Features Grid */}
      {features.length > 0 && (
        <Section>
          <Container>
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
                  ماذا ستكتشف في <span className="text-primary">هذا الكتاب؟</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  صمم هذا الدليل ليقدم لك أدوات عملية واستراتيجيات فعالة تساعدك في فهم نفسك وتطوير مهاراتك بشكل متكامل.
                </p>
                {book.tests.length > 0 ? (
                  <BookTestModal 
                    testId={book.tests[0].slug} 
                    triggerButtonText="ابدأ الاختبار الآن"
                    className="rounded-full shadow-lg h-14 px-8 font-bold text-base group"
                  />
                ) : (
                  <Link href="#pricing">
                    <Button size="lg" className="rounded-full shadow-lg h-14 px-8 font-bold text-base">
                      احصل على نسختك
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature: any, idx: number) => (
                  <div key={idx} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/30 transition-colors">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mb-4" />
                    <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      )}

      {/* 4. Audience Grid */}
      {audience.length > 0 && (
        <Section className="bg-primary/5">
          <Container>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black mb-4">لمن هذا الكتاب؟</h2>
              <p className="text-muted-foreground text-lg">سواء كنت فرداً يبحث عن التطوير، أو قائداً يسعى للإرتقاء بفريقه</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
               {audience.map((item: any, idx: number) => (
                 <div key={idx} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center">
                   <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                     <Users className="w-6 h-6 text-primary" />
                   </div>
                   <h3 className="font-bold mb-2">{item.title}</h3>
                   <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                 </div>
               ))}
            </div>
          </Container>
        </Section>
      )}

      {/* 5. Personal Assistant Focus (Optional Section if data provided) */}
      {assistant?.title && (
        <Section>
          <Container>
            <div className="bg-card border border-border rounded-[40px] p-8 md:p-16 shadow-2xl relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
               <div className="relative z-10 max-w-3xl mx-auto text-center">
                 <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
                   <Star className="w-8 h-8" />
                 </div>
                 <h2 className="text-3xl md:text-4xl font-black mb-6">{assistant.title}</h2>
                 <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                   {assistant.description}
                 </p>
                 
                 {assistant.labels && Array.isArray(assistant.labels) && (
                   <div className="flex flex-wrap justify-center gap-3 mb-10">
                     {assistant.labels.map((label: string, i: number) => (
                       <span key={i} className="px-5 py-2 rounded-full bg-background border border-border font-bold text-sm">
                         {label}
                       </span>
                     ))}
                   </div>
                 )}
                 
                 {(assistant.examplePos || assistant.exampleNeg) && (
                   <div className="grid sm:grid-cols-2 gap-4 text-right">
                     {assistant.examplePos && (
                       <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
                         <h4 className="font-black text-emerald-600 mb-2">أمثلة إيجابية</h4>
                         <p className="text-sm text-foreground/80">{assistant.examplePos}</p>
                       </div>
                     )}
                     {assistant.exampleNeg && (
                       <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
                         <h4 className="font-black text-rose-600 mb-2">من الأخطاء الشائعة</h4>
                         <p className="text-sm text-foreground/80">{assistant.exampleNeg}</p>
                       </div>
                     )}
                   </div>
                 )}
               </div>
            </div>
          </Container>
        </Section>
      )}

      {/* 6. Pricing Plans */}
      <Section id="pricing" className="bg-muted/30">
        <Container>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">ابدأ مجانًا، ثم اختر ما يناسبك</h2>
            <p className="text-muted-foreground text-lg font-bold">باقات واضحة — اختر باقتك وانتقل مباشرة للدفع</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'plan-card flex flex-col h-full',
                  plan.isFeatured && 'plan-card-featured'
                )}
              >
                {plan.badge && (
                  <span className="absolute top-4 left-4 rounded-full bg-gradient-to-br from-primary to-accent text-[#1c1308] text-xs font-black px-3 py-1.5">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-xl font-black mb-4 mt-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-black">{plan.price === 0 ? '0' : plan.price}</span>
                  <span className="text-muted-foreground text-sm font-bold mr-1">ر.س</span>
                  {plan.oldPrice != null && plan.oldPrice > 0 && (
                    <span className="block text-muted-foreground line-through text-sm mt-1 font-bold">
                      {plan.oldPrice} ر.س
                    </span>
                  )}
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex gap-2 text-sm font-bold text-[#4c3920]">
                      <Check className="w-5 h-5 text-primary shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={getPackageActionUrl(book.id, plan, testSlug, testId)}
                  className={cn(
                    'w-full text-center',
                    plan.isFeatured && plan.price > 0
                      ? 'btn-gold'
                      : 'btn-ghost-warm'
                  )}
                >
                  {plan.ctaLabel}
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 7. Final CTA */}
      <Section className="pb-32">
        <Container>
          <div className="bg-gradient-to-br from-[#1a202c] to-[#2d3748] rounded-[40px] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
             <div className="relative z-10 max-w-2xl mx-auto">
               <h2 className="text-3xl md:text-5xl font-black mb-6">
                 {book.ctaTitle || 'ابدأ رحلة فهم ذاتك اليوم'}
               </h2>
               <p className="text-lg text-white/80 mb-10 leading-relaxed">
                 {book.ctaDescription || 'احصل على نسختك الآن واستفد من الاختبارات العملية والمادة العلمية الدقيقة لبناء حياة أكثر توازناً ونجاحاً.'}
               </p>
               {book.tests.length > 0 ? (
                 <BookTestModal 
                   testId={book.tests[0].slug} 
                   triggerButtonText="ابدأ رحلتك الآن"
                   className="bg-primary hover:bg-primary/90 text-white rounded-full font-black px-10 h-16 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform group"
                 />
               ) : (
                 <Button disabled size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full font-black px-10 h-16 text-lg shadow-xl shadow-primary/20 opacity-50 cursor-not-allowed">
                   غير متوفر
                 </Button>
               )}
             </div>
          </div>
        </Container>
      </Section>
      
    </main>
  )
}
