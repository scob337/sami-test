import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { HeroSection } from '@/components/layout/hero-section'

export default function AboutPage() {
  return (
    <main className="min-h-screen pb-16 bg-background text-foreground" dir="rtl">
      <HeroSection 
        title="حول الخدمة"
        description="7Types هو منصة متقدمة تهدف إلى مساعدتك في اكتشاف نمط شخصيتك وتطوير مهاراتك من خلال اختبارات علمية دقيقة وكورسات تعليمية متخصصة."
        badge="من نحن"
      />
      <Section size="lg" className="pt-0">
        <Container size="md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
            <div className="bg-card dark:bg-white/5 p-8 rounded-2xl border border-border dark:border-white/10 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-blue-500 dark:text-blue-400">رؤيتنا</h2>
              <p className="text-muted-foreground">نسعى لتمكين الأفراد من فهم أنفسهم بشكل أعمق لتحقيق توازن أفضل في حياتهم الشخصية والمهنية.</p>
            </div>
            <div className="bg-card dark:bg-white/5 p-8 rounded-2xl border border-border dark:border-white/10 shadow-sm">
              <h2 className="text-2xl font-bold mb-4 text-emerald-500 dark:text-emerald-400">رسالتنا</h2>
              <p className="text-muted-foreground">تقديم أدوات تحليلية مبنية على أسس علمية وذكاء اصطناعي لتوفير نتائج دقيقة وتوصيات عملية.</p>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
