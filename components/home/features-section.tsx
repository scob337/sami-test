'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/layout/container'
import { UserCheck, Zap, BookOpen, Shield, BarChart3, Share2 } from 'lucide-react'

const features = [
  {
    icon: UserCheck,
    title: 'تحليل الخبراء',
    description: 'نستخدم أحدث المناهج العلمية لتحليل إجاباتك بدقة وتقديم رؤى شاملة لنواحي شخصيتك.',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
  },
  {
    icon: Zap,
    title: 'نتائج فورية',
    description: 'بمجرد الانتهاء، ستحصل على تقريرك الشامل في بضع ثوانٍ فقط دون انتظار.',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
  },
  {
    icon: BookOpen,
    title: 'موارد تعليمية',
    description: 'نقدم لك اقتراحات كتب وموارد مخصصة لنوع شخصيتك تساعدك في تطوير ذاتك.',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Shield,
    title: 'خصوصيتك آمنة',
    description: 'تشفير كامل لبياناتك. نحن نحترم خصوصيتك ولا نشارك معلوماتك مع أي طرف ثالث.',
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
  },
  {
    icon: BarChart3,
    title: 'إحصائيات دقيقة',
    description: 'رسوم بيانية توضح نقاط القوة والضعف لديك وكيفية التعامل مع التحديات اليومية.',
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-400',
  },
  {
    icon: Share2,
    title: 'مشاركة سهلة',
    description: 'شارك بطاقة نتائجك المصممة باحترافية مع أصدقائك عبر منصات التواصل الاجتماعي.',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-background">
      <Container>
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
              لماذا تختار{' '}
              <span className="primary-gradient bg-clip-text text-transparent">
                منصتنا؟
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              نجمع بين علم النفس التحليلي وأحدث التقنيات لنقدم لك أدق نظام لفهم الذات وتطويرها.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
              >
                <div className="bg-card border border-border relative h-full p-8 rounded-2xl transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                  <div className={`w-14 h-14 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

