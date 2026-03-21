import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-24 pb-16 bg-[#0A1A3B] text-white" dir="rtl">
      <Section size="lg">
        <Container size="md">
          <div className="prose prose-invert max-w-none text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-8">حول الخدمة</h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-12">
              سامي تست هو منصة متقدمة تهدف إلى مساعدتك في اكتشاف نمط شخصيتك وتطوير مهاراتك من خلال اختبارات علمية دقيقة وكورسات تعليمية متخصصة.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-right">
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4 text-blue-400">رؤيتنا</h2>
                <p className="text-slate-300">نسعى لتمكين الأفراد من فهم أنفسهم بشكل أعمق لتحقيق توازن أفضل في حياتهم الشخصية والمهنية.</p>
              </div>
              <div className="bg-white/5 p-8 rounded-2xl border border-white/10">
                <h2 className="text-2xl font-bold mb-4 text-emerald-400">رسالتنا</h2>
                <p className="text-slate-300">تقديم أدوات تحليلية مبنية على أسس علمية وذكاء اصطناعي لتوفير نتائج دقيقة وتوصيات عملية.</p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
