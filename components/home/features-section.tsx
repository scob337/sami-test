'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/layout/container'
import { UserCheck, Zap, BookOpen, Shield, BarChart3, Share2 } from 'lucide-react'

const features = [
  {
    icon: UserCheck,
    title: 'تحليل الخبراء',
    description: 'نستخدم أحدث المناهج العلمية لتحليل إجاباتك بدقة وتقديم رؤى شاملة لنواحي شخصيتك.',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    icon: Zap,
    title: 'نتائج فورية',
    description: 'بمجرد الانتهاء، ستحصل على تقريرك الشامل في بضع ثوانٍ فقط دون انتظار.',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    icon: BookOpen,
    title: 'موارد تعليمية',
    description: 'نقدم لك اقتراحات كتب وموارد مخصصة لنوع شخصيتك تساعدك في تطوير ذاتك.',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    icon: Shield,
    title: 'خصوصيتك آمنة',
    description: 'تشفير كامل لبياناتك. نحن نحترم خصوصيتك ولا نشارك معلوماتك مع أي طرف ثالث.',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
  {
    icon: BarChart3,
    title: 'إحصائيات دقيقة',
    description: 'رسوم بيانية توضح نقاط القوة والضعف لديك وكيفية التعامل مع التحديات اليومية.',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    icon: Share2,
    title: 'مشاركة سهلة',
    description: 'شارك بطاقة نتائجك المصممة باحترافية مع أصدقائك عبر منصات التواصل الاجتماعي.',
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-32 relative overflow-hidden bg-background">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full -ml-40 -mb-40" />

      <Container className="relative z-10">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-bold">
              مميزات استثنائية
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
              لماذا تختار{' '}
              <span className="bg-gradient-to-l from-primary to-accent-foreground bg-clip-text text-transparent italic">
                منصتنا؟
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
              نجمع بين علم النفس التحليلي وأحدث التقنيات لنقدم لك أدق نظام لفهم الذات وتطويرها بأسلوب عصري ومبتكر.
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <div className="bg-card/40 backdrop-blur-xl border border-border/50 relative h-full p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 group-hover:bg-card/60">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 md:mb-8 shadow-inner transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}>
                    <Icon className={`w-7 h-7 md:w-8 md:h-8 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4 text-foreground group-hover:text-primary transition-colors tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base md:text-lg font-bold opacity-80 group-hover:opacity-100 transition-opacity">
                    {feature.description}
                  </p>
                  
                  {/* Decorative corner element */}
                  <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-primary/0 group-hover:border-primary/40 transition-all duration-500 rounded-bl-xl" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

