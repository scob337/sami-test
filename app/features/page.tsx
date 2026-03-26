import { Section } from '@/components/layout/section'
import { Container } from '@/components/layout/container'
import { Sparkles, Lock, Timer, BarChart3, Video } from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    { icon: () => <img src="/Logo.png" alt="" className="w-12 h-12 object-contain" />, title: 'تحليل ذكي', desc: 'خوارزميات متقدمة لتحليل إجاباتك بدقة عالية.', color: 'text-blue-500' },
    { icon: Sparkles, title: 'توصيات مخصصة', desc: 'نصائح عملية بناءً على نمط شخصيتك الفريد.', color: 'text-emerald-500' },
    { icon: Video, title: 'كورسات تعليمية', desc: 'محتوى مرئي يساعدك على تطوير نقاط قوتك.', color: 'text-purple-500' },
    { icon: Lock, title: 'خصوصية تامة', desc: 'بياناتك ونتائجك في أمان تام ومحفوظة بخصوصية.', color: 'text-amber-500' },
    { icon: Timer, title: 'نتائج فورية', desc: 'احصل على تقريرك مباشرة بعد الانتهاء من الاختبار.', color: 'text-rose-500' },
    { icon: BarChart3, title: 'تقارير مفصلة', desc: 'تقرير شامل يشمل كل جوانب شخصيتك.', color: 'text-cyan-500' },
  ]

  return (
    <main className="min-h-screen pt-24 pb-16 bg-[#0A1A3B] text-white" dir="rtl">
      <Section size="lg">
        <Container>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black mb-6">مميزات 7Types</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">نقدم لك مجموعة متكاملة من الأدوات لفهم شخصيتك وتطوير ذاتك.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-white/5 p-10 rounded-3xl border border-white/10 hover:border-blue-500/30 transition-all group">
                <div className="mb-6 flex items-center justify-center w-12 h-12">
                   <feature.icon className={`w-12 h-12 ${feature.color} group-hover:scale-110 transition-transform`} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  )
}
