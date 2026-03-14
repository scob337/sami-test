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
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-background">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-10 relative z-20 text-right"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 w-fit text-primary border border-primary/20">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-semibold tracking-wide">الجيل القادم من اختبارات تحليل الشخصية</span>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.15] tracking-tight text-foreground">
                اكتشف جوهر{' '}
                <span className="primary-gradient bg-clip-text text-transparent italic">
                  شخصيتك
                </span>
                {' '}بعمق
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                تجربة فريدة تعتمد على أحدث المناهج العلمية لتحليل أنماط سلوكك وتقديم رؤى عميقة لمستقبلك الشخصي والمهني بإشراف الخبراء.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-5">
              <Link href="/test">
                <Button 
                  size="lg"
                  className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20 group text-lg font-bold cursor-pointer transition-all"
                >
                  ابدأ رحلة الاكتشاف
                  <ArrowRight className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button 
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 rounded-2xl bg-secondary text-foreground text-lg border border-border hover:bg-muted hover:border-primary/40 font-semibold cursor-pointer transition-all"
                >
                  كيف يعمل النظام؟
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              variants={itemVariants} 
              className="flex items-center gap-12 pt-10"
            >
              {[
                { label: 'مستخدم نشط', value: '50K+' },
                { label: 'دقة التحليل', value: '99.2%' },
                { label: 'نمط شخصية', value: '16' }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-3xl font-bold text-foreground mb-1">{stat.value}</span>
                  <span className="text-sm text-muted-foreground font-medium">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column: Visual Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square">
              {/* Central Premium Element */}
              <motion.div 
                variants={floatingVariants}
                animate="animate"
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <div className="w-80 h-80 rounded-[40px] primary-gradient flex items-center justify-center p-1 shadow-[0_0_80px_-15px_rgba(59,130,246,0.3)]">
                  <div className="w-full h-full bg-card rounded-[38px] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                    <UserCheck className="w-32 h-32 text-primary group-hover:scale-110 transition-transform duration-700" />
                  </div>
                </div>
              </motion.div>

              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 right-0 z-20"
              >
                <div className="bg-card border border-border rounded-2xl shadow-lg p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-bold text-sm">تحليل فوري</h4>
                    <p className="text-xs text-muted-foreground">نتائج في أقل من دقيقة</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-20 left-0 z-20"
              >
                <div className="bg-card border border-border rounded-2xl shadow-lg p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-accent-foreground">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-bold text-sm">دقة متناهية</h4>
                    <p className="text-xs text-muted-foreground">توصيات مخصصة لكل شخص</p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Rings */}
              <div className="absolute inset-0 border border-border rounded-full scale-[1.2] opacity-50" />
              <div className="absolute inset-0 border border-border/50 rounded-full scale-[1.5] opacity-25" />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
