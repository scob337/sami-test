'use client'

import { motion, Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/layout/container'
import Link from 'next/link'
import { Sparkles, ArrowRight, UserCheck, Zap, Target } from 'lucide-react'

export function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const floatingVariants: Variants = {
    animate: {
      y: [0, -12, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-accent/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[150px] rounded-full" />
      </div>

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Column: Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-10 text-right"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 w-fit text-primary border border-primary/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-bold tracking-wide">الجيل القادم من اختبارات تحليل الشخصية</span>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-8">
              <h1 className="text-6xl md:text-8xl font-black leading-[1.1] tracking-tight text-foreground">
                اكتشف جوهر{' '}
                <span className="bg-gradient-to-l from-primary via-accent-foreground to-primary bg-clip-text text-transparent italic drop-shadow-sm">
                  شخصيتك
                </span>
                {' '}بعمق
              </h1>
              <p className="text-xl md:text-2xl text-foreground font-bold opacity-80 leading-relaxed max-w-2xl">
                تجربة فريدة تعتمد على أحدث المناهج العلمية لتحليل أنماط سلوكك وتقديم رؤى عميقة لمستقبلك الشخصي والمهني بإشراف الخبراء.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
              <Link href="/test">
                <Button 
                  size="lg"
                  className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/30 group text-xl font-black cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  ابدأ رحلة الاكتشاف
                  <ArrowRight className="mr-3 w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button 
                  size="lg"
                  variant="outline"
                  className="h-16 px-10 rounded-2xl bg-background/50 backdrop-blur-md text-foreground text-xl border-2 border-border hover:bg-secondary/50 hover:border-primary/40 font-bold cursor-pointer transition-all"
                >
                  كيف يعمل النظام؟
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="flex items-center gap-16 pt-12"
            >
              {[
                { label: 'مستخدم نشط', value: '50K+' },
                { label: 'دقة التحليل', value: '99.2%' },
                { label: 'نمط شخصية', value: '16' }
              ].map((stat, i) => (                <div key={i} className="flex flex-col group">
                  <span className="text-4xl font-black text-foreground group-hover:text-primary transition-colors">{stat.value}</span>
                  <span className="text-base font-bold text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column: Visual Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 w-full aspect-square max-w-[600px] mx-auto">
              {/* Main Illustration Placeholder with Glassmorphism Effect */}
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary/20 to-indigo-500/10 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-[url('/placeholder.jpg')] bg-cover bg-center opacity-40 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                
                {/* Floating Elements */}
                <motion.div 
                  variants={floatingVariants}
                  animate="animate"
                  className="absolute top-10 right-10 p-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl"
                >
                  <UserCheck className="w-10 h-10 text-primary" />
                </motion.div>
                
                <motion.div 
                  variants={floatingVariants}
                  animate="animate"
                  className="absolute bottom-20 left-10 p-6 rounded-3xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl"
                  style={{ transitionDelay: '1s' }}
                >
                  <Zap className="w-10 h-10 text-amber-400" />
                </motion.div>

                <motion.div 
                  variants={floatingVariants}
                  animate="animate"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-8 rounded-[2.5rem] bg-primary/20 backdrop-blur-3xl border border-primary/30 shadow-2xl"
                >
                  <Target className="w-16 h-16 text-white animate-pulse" />
                </motion.div>
              </div>

              {/* Decorative Rings */}
              <div className="absolute -inset-10 border-2 border-primary/10 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="absolute -inset-20 border border-primary/5 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
