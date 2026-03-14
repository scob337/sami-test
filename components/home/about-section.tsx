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
    <section id="about" className="py-32 bg-background relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -ml-48 pointer-events-none" />
      
      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="order-2 lg:order-1 relative group max-w-[500px] mx-auto lg:max-w-none"
          >
            <div className="relative aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white/50 ring-1 ring-border/50">
               <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
               <img 
                 src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                 alt="فريق العمل"
                 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
               />
            </div>
            {/* Floating Badge */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 bg-card/80 backdrop-blur-2xl p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-2 border-border/50 shadow-2xl flex items-center gap-3 md:gap-4"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div className="text-right">
                <div className="text-lg md:text-xl font-black text-foreground">معتمد علمياً</div>
                <div className="text-xs md:text-sm font-bold text-muted-foreground">بواسطة خبراء النفس</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 md:space-y-10 order-1 lg:order-2 text-center lg:text-right flex flex-col items-center lg:items-end"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-black uppercase tracking-widest">
                قصتنا ورؤيتنا
              </div>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-foreground leading-[1.1] tracking-tight">
                نساعدك على فهم <span className="bg-gradient-to-l from-primary to-accent-foreground bg-clip-text text-transparent italic">نفسك</span> بشكل أعمق
              </h2>
              <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed font-bold opacity-80 max-w-2xl">
                انطلقت MindMatch بهدف سد الفجوة بين علوم النفس التقليدية واحتياجات العصر الحديث. نحن نؤمن أن فهم الذات هو المفتاح الأول للنجاح المهني والشخصي.
              </p>
            </div>

            <div className="grid gap-4 md:gap-6 w-full">
              {[
                'تحليل علمي دقيق يعتمد على الأنماط السبعة للشخصية.',
                'توصيات مخصصة لكل مستخدم بناءً على نتائجه الفريدة.',
                'مكتبة رقمية تضم كتباً مختارة بعناية لدعم رحلة نموك.',
                'خصوصية تامة وسرية مطلقة لجميع بياناتك وإجاباتك.'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 text-foreground group text-right justify-center lg:justify-end">
                  <span className="font-black text-lg md:text-xl tracking-tight flex-1 lg:flex-none">{item}</span>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all border border-primary/20 shrink-0">
                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 md:gap-8 pt-8 md:pt-10 border-t-2 border-border/50 w-full">
              {stats.map((stat, i) => {
                const Icon = stat.icon
                return (
                  <div key={i} className="text-center lg:text-right space-y-2 group cursor-default">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-secondary/50 flex items-center justify-center mb-2 md:mb-4 border border-border/50 group-hover:bg-primary group-hover:text-white transition-all duration-300 mx-auto lg:mr-0 lg:ml-auto">
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-foreground group-hover:text-primary transition-colors">{stat.value}</div>
                    <div className="text-[10px] md:text-sm font-black text-muted-foreground uppercase tracking-widest opacity-60 leading-tight">{stat.label}</div>
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
