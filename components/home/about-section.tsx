'use client'

import { motion } from 'framer-motion'
import { Container } from '@/components/layout/container'
import { CheckCircle2, Award, Users, BookOpen } from 'lucide-react'

export function AboutSection() {
  const stats = [
    { label: 'مشارك في الاختبار', value: '50K+', icon: Users },
    { label: 'دقة التحليل', value: '99%', icon: Award },
    { label: 'كتاب ومصدر تعليمي', value: '12', icon: BookOpen },
  ]

  return (
    <section id="about" className="py-24 bg-secondary">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 mix-blend-overlay" />
               <img 
                 src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                 alt="فريق العمل"
                 className="w-full h-full object-cover"
               />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8 order-1 lg:order-2 text-right"
          >
            <div className="space-y-4">
              <h3 className="text-primary font-bold tracking-wider uppercase text-sm">عن المنصة</h3>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                نساعدك على فهم <span className="text-primary">نفسك</span> بشكل أعمق
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                انطلقت MindMatch بهدف سد الفجوة بين علوم النفس التقليدية واحتياجات العصر الحديث. نحن نؤمن أن فهم الذات هو المفتاح الأول للنجاح المهني والشخصي.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                'تحليل علمي دقيق يعتمد على الأنماط السبعة للشخصية.',
                'توصيات مخصصة لكل مستخدم بناءً على نتائجه الفريدة.',
                'مكتبة رقمية تضم كتباً مختارة بعناية لدعم رحلة نموك.',
                'خصوصية تامة وسرية مطلقة لجميع بياناتك وإجاباتك.'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-foreground">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="font-medium text-lg">{item}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="text-center space-y-1">
                    <div className="flex justify-center mb-2">
                      <Icon className="w-6 h-6 text-primary/60" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
